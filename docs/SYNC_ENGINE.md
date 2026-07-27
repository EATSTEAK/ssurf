# Sync 엔진 개선안

> 상태: 제안

## 목적

네트워크 동기화를 React lifecycle에서 분리한다. 앱 시작, UI 데이터 요청,
사용자 새로고침은 같은 엔진을 호출한다. UI는 SQLite 데이터와 동기화 상태만
구독한다.

```text
App bootstrap ─┐
React hook ─────┼─> Sync Engine ─> Entity Service ─> SQLite ─> useLiveQuery
User refresh ──┘         └──────── Sync Store ───────────────> React
```

현재는 client가 준비되기 전에 query effect가 실행되면 `sync()`가 종료되고,
client 준비 후 effect가 다시 실행되지 않을 수 있다. 실행을 외부 엔진이 소유하고
client readiness를 Promise로 기다리게 해 이 순서 의존성을 제거한다.

## 원칙

1. SQLite가 데이터의 유일한 source of truth다.
2. 엔진은 React를 import하지 않는다.
3. 동일한 요청은 하나의 Promise를 공유한다.
4. client readiness, TTL, UI mount 순서가 요청을 유실시키지 않는다.

## 최소 인터페이스

```ts
export type SyncRequest = {
  key: readonly [scope: string, resource: string];
  run: () => Promise<void>;
  ttlMs?: number;
};

export type SyncResult = 'failed' | 'fresh' | 'synced';

export function ensure(request: SyncRequest): Promise<SyncResult>;
export function refresh(request: SyncRequest): Promise<SyncResult>;
```

- `ensure`: 캐시가 없거나 TTL이 만료된 경우에만 실행한다.
- `refresh`: TTL을 무시한다.
- 실행 중인 동일 key가 있으면 둘 다 기존 Promise를 반환한다.
- 실패는 상태에 기록하지만 다음 호출을 막지 않는다.
- `scope`는 `studentId` 또는 `__global__`이다.

별도의 registry, scheduler, event bus는 두지 않는다.

## 엔진

`src/shared/lib/syncEngine.ts`에 React와 무관한 실행 로직을 둔다.

```ts
const inFlight = new Map<string, Promise<SyncResult>>();

const execute = (request: SyncRequest, force: boolean) => {
  const id = request.key.join(':');
  const running = inFlight.get(id);
  if (running) return running;

  const job = Promise.resolve()
    .then(async (): Promise<SyncResult> => {
      if (!force && (await isFresh(request))) return 'fresh';

      syncStore.getState().start(id);
      try {
        await request.run();
        syncStore.getState().succeed(id);
        return 'synced';
      } catch (error) {
        syncStore.getState().fail(id, toError(error));
        return 'failed';
      }
    })
    .finally(() => inFlight.delete(id));

  inFlight.set(id, job);
  return job;
};

export const ensure = (request: SyncRequest) => execute(request, false);
export const refresh = (request: SyncRequest) => execute(request, true);
```

`isFresh()`는 기존 `cache` 테이블의 `(scope, resource, updatedAt)`만 확인한다.
실제 데이터와 cache timestamp 저장은 지금처럼 entity service의 같은 DB
transaction에서 처리한다.

## 상태 저장소

`src/shared/stores/syncStore.ts`를 `zustand/vanilla`의 `createStore()`로 바꾼다.

```ts
type SyncStatus = {
  error?: Error;
  isSyncing: boolean;
};

type SyncStore = {
  requests: Map<string, SyncStatus>;
  start: (id: string) => void;
  succeed: (id: string) => void;
  fail: (id: string, error: Error) => void;
};
```

`lastSuccessAt`은 DB cache에 이미 있으므로 store에 중복 저장하지 않는다.
사용자 상태 격리는 `scope:resource` key로 해결한다.

## Application Runtime

client 생성도 UI 컴포넌트가 아니라 앱 수명의 runtime이 소유한다.

```ts
applications.start(session, studentId);
applications.get('grades'); // 준비될 때까지 기다린 뒤 반환
applications.reset();
```

- 기존 builder 순서는 USaint 부하를 고려해 직렬로 유지한다.
- 각 client는 생성되는 즉시 해당 Promise를 resolve한다.
- 생성 실패 시 Promise를 reject해 요청이 무기한 대기하지 않게 한다.
- 기본 학기가 필요한 client는 `{ client, defaultSemester }`를 함께 resolve한다.
- 세션마다 generation을 부여해 이전 세션의 늦은 결과를 무시한다.
- `RusaintApplicationProvider`는 runtime 상태를 React에 전달하는 adapter로만
  남긴다.

Entity request의 `run()`이 runtime을 기다리므로 준비 전 요청도 유실되지 않는다.

```ts
const courseScheduleSync = (studentId: string, year: number, semester: SemesterType) => ({
  key: [studentId, `personalCourseSchedule.${year}-${semester}`] as const,
  run: async () => {
    const { client } = await applications.get('personalCourseSchedule');
    await syncCourseSchedule(client, studentId, year, semester);
  },
});
```

## React adapter

`src/shared/lib/useSync.ts`는 demand 등록과 상태 구독만 담당한다.

```ts
export function useSync(request: SyncRequest) {
  const requestRef = useRef(request);
  requestRef.current = request;

  const id = request.key.join(':');
  const state = useStore(syncStore, (store) => store.requests.get(id));

  useEffect(() => {
    void ensure(requestRef.current);
  }, [id]);

  return {
    error: state?.error,
    isSyncing: state?.isSyncing ?? false,
    refresh: () => refresh(requestRef.current),
  };
}
```

컴포넌트 unmount는 store 구독만 해제한다. 엔진의 Promise와 DB 저장은 계속된다.

Entity query hook은 DB 조회와 sync request를 결합한다.

```ts
export function useCourseSchedule(year: number, semester: SemesterType) {
  const request = courseScheduleSync(studentId, year, semester);
  const sync = useSync(request);
  const query = useLiveQuery(/* SQLite query */);

  return { ...query, ...sync };
}
```

화면은 `refresh()`만 호출하고 최초 요청 effect를 직접 만들지 않는다.

## 호출 지점

### 앱 시작

DB migration과 session 확인 후 필요한 최소 데이터만 요청한다.

```ts
void ensure(feedSitesSync(studentId));
void ensure(studentInformationSync(studentId));
```

모든 탭 데이터를 미리 가져오지는 않는다.

### UI 데이터 요청

Entity query hook의 `useSync()`가 `ensure()`를 호출한다.

### 사용자 새로고침

```ts
await refresh();
```

동일 요청이 이미 실행 중이면 추가 요청 없이 해당 Promise를 기다린다.

## 적용 순서

1. `syncEngine.ts`와 vanilla `syncStore`를 추가한다.
2. Application Runtime을 분리한다.
3. `useSync()` React adapter를 추가한다.
4. `studentInformation`, `scholarships`로 동작을 검증한다.
5. `courseSchedule`, `chapel`, `grades`, `graduationRequirements`를 이전한다.
6. `feed`, `calendar`의 단일 resource 실행만 공통 엔진으로 옮긴다.
7. query와 화면의 기존 `useAsyncEffect`/`useEffect` sync 호출을 제거한다.
8. 기존 `src/shared/lib/sync.ts`와 중복 로직을 삭제한다.

여러 slug를 묶는 `Promise.all`은 entity 계층에 남긴다. 공통 엔진은 단일 key만 실행한다.

## 검증 기준

- client 준비 전 요청이 준비 후 정확히 한 번 실행된다.
- 요청 중 UI가 unmount되어도 DB 저장이 완료된다.
- 같은 key를 여러 hook이 요청해도 service는 한 번만 실행된다.
- TTL 안의 재진입은 네트워크를 호출하지 않는다.
- 사용자 새로고침은 TTL을 무시한다.
- 실패 후 다음 refresh가 정상 재시도한다.
- 사용자 전환 시 sync/error 상태가 섞이지 않는다.

테스트 프레임워크는 추가하지 않는다. pure engine은 `node:assert/strict` 기반의
작은 실행 스크립트로 readiness, dedupe, TTL, retry만 검증한다.

## 비대상

- OS background task
- 오프라인 영구 큐
- 자동 exponential backoff
- 새로운 데이터 캐시 라이브러리
- 모든 데이터의 startup prefetch
