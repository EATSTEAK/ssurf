# SUF-110 구현 계획

연구 근거는 [SUF-110-RESEARCH.md](./SUF-110-RESEARCH.md)를 참조한다.

## 확정 범위

이번 이슈에서 구현한다.

1. 향후 성적·채플 detector가 사용할 **Rusaint 전용 얕은 Resource Pipeline 프레임워크**
2. 학생이 선택한 공지 사이트의 **새 공지 ID 감지 기능**
3. 1시간 최소 간격의 단일 Expo BackgroundTask
4. 백그라운드에서는 카테고리별 로컬 알림 발송
5. 앱이 active로 복귀하면 OS 알림 없이 변경 리소스를 즉시 foreground sync
6. 로그인 직후 알림 권한 요청과 worker 등록

이번 이슈에서는 실제 Rusaint 성적·채플 detector를 등록하지 않는다.
프레임워크와 실행 경계만 구현하고, 공지 detector가 실제 동작을 검증한다.

## 확정 동작

- 공지 감시 대상: `feed.selectedNoticeSlugs`
- 공지 변경 기준: 로컬 DB와 이전 detector baseline에 없는 새 공지 ID
- 첫 실행: 현재 원격 ID 목록을 baseline으로 저장하고 알림을 보내지 않음
- 알림 묶음: 카테고리별. 이번 범위에서는 한 실행당 공지 알림 최대 1개
- foreground 감지: 알림 없이 변경된 slug만 즉시 sync
- 정확한 1시간 실행은 보장하지 않으며 `minimumInterval: 60`은 OS 힌트로만 사용

## 비범위

- 성적·채플의 실제 변경 규칙과 detector 등록
- 서버, 원격 push, silent/data notification
- background entity sync
- exact scheduling
- 범용 plugin registry 또는 임의 stage 조합 엔진
- foreground 배너·토스트
- 알림 주기 설정 UI

## 설계

### 1. Rusaint Resource Pipeline

공개 API는 리소스 정의와 단일 runner만 제공한다. 실행 단계의 순서는 프레임워크 내부에 고정한다.

```ts
type RusaintPipeline<TClient, TValue, TTarget> = {
  client: 'chapel' | 'grades';
  fingerprint: (value: TValue) => string;
  id: string;
  observe: (context: RusaintObservationContext<TClient>) => Promise<TValue>;
  readApplied: (context: RusaintAppliedContext) => Promise<null | TValue>;
  settingKey: RusaintNotificationSettingKey;
  target: (value: TValue) => TTarget;
};

const pipeline = defineRusaintPipeline({ ... });
const run = await runRusaintPipelines([pipeline], options);
```

내부 순서:

```text
enabled setting 확인
→ 자격 증명으로 session 한 번 생성
→ 필요한 client만 lazy 생성·공유
→ remote observe
→ applied local read
→ canonical fingerprint 비교
→ 기존 dedupe state 비교
→ typed change 반환
```

규칙:

- `applications.start()`를 사용하지 않는다.
- 한 실행에서 session은 하나만 만든다.
- 같은 `client` 종류는 한 promise를 공유한다.
- pipeline은 순차 실행해 Rusaint 페이지 상태 경쟁을 피한다.
- pipeline은 entity table과 기존 sync cache를 읽을 수 있지만 쓰지 않는다.
- 설정 비활성화 pipeline은 client를 만들기 전에 skip한다.
- 중복 `id`는 실행 전에 거부한다.
- 중첩 실행은 같은 in-flight promise를 공유한다.

### 2. 감지 결과와 acknowledge

알림 예약 또는 foreground sync 실패 전에 dedupe state가 갱신되면
변경을 잃을 수 있다. 따라서 감지와 승인 단계를 분리한다.

```ts
type DetectionRun<TChange> = {
  acknowledge: (changes: readonly TChange[]) => Promise<void>;
  changes: readonly TChange[];
  errors: readonly DetectionError[];
};
```

- background: 로컬 알림 예약 성공 후 해당 변경을 `acknowledge`
- foreground: 관련 sync 성공 후 해당 변경을 `acknowledge`
- 실패한 변경은 승인하지 않아 다음 실행에서 재시도
- 최초 baseline과 “변경 없음” 상태 갱신은 내부에서 안전하게 처리

프레임워크는 dedupe 저장 규칙을 소유하고, 스케줄링·알림 내용·foreground sync는 외부 runner가 소유한다.

### 3. detector state 저장

새 테이블은 만들지 않는다. 기존 학생별 `settings` 테이블에 내부 상태 키를 추가한다.

예상 키:

- `notifications.rusaint.detectorState`
- `notifications.notice.detectorState`

Rusaint state는 pipeline/resource fingerprint를 저장한다. 공지 state는
사이트별로 이전에 관찰한 공지 ID 목록을 저장한다. 공지는 신규와 삭제를
구분해야 하므로 fingerprint만 저장하지 않는다.

상태는 학생별로 분리해 계정 간 detector state가 섞이지 않게 한다.

### 4. 공지 원격 읽기 분리

현재 `syncFeedEntry()`의 HTTP 조회와 SQLite write를 분리한다.

```text
fetchFeedEntry(slug) -> SsufidNoticeResponse
syncFeedEntry(slug) -> fetchFeedEntry + 기존 transaction
```

공지 detector는 `fetchFeedEntry()`만 사용한다. background 실행 중
`feedNotices`와 `cache`는 변경하지 않는다.

사이트별 동작:

1. 원격 공지 ID 목록을 읽고 정렬·중복 제거
2. 로컬 `feedNotices` ID 목록과 detector state의 이전 관찰 ID 목록을 읽음
3. `remote - local`이 비어 있지 않으면 해당 slug를 변경으로 반환
4. 최초 상태이면서 로컬 baseline도 없으면 현재 원격 목록만 저장하고 알리지 않음
5. 삭제 또는 순서 변경은 알리지 않되 관찰 상태는 갱신
6. 알림 또는 foreground sync 성공 후 새 원격 목록을 승인

선택 slug 중 일부가 실패해도 나머지는 계속 검사한다.

### 5. task와 실행 orchestrator

신규 task 모듈에서 `TaskManager.defineTask()`를 module scope에 정의한다.
`src/index.tsx`가 Router보다 먼저 import한다.

단일 background 실행:

```text
저장된 user-info 확인
→ notice enabled/selected slugs 확인
→ 공지 detector 실행
→ 향후 RUSAINT_PIPELINES 실행
→ 카테고리별 로컬 알림 예약
→ 성공한 변경 acknowledge
→ Expo BackgroundTask result 반환
```

현재 `RUSAINT_PIPELINES`는 빈 정적 배열이다. 공지 detector는 Rusaint pipeline에 등록하지 않는다.

결과 정책:

- 로그인 정보가 없거나 모든 기능이 비활성화: 성공으로 skip
- 일부 source 실패: 성공한 변경은 처리하고 오류 기록
- 모든 활성 source 실패: `Failed`
- 동일 process의 background/foreground 중첩: shared single-flight로 한 실행만 수행

### 6. 권한과 등록 생명주기

`RootLayoutNav`에서 migration과 credential loading이 끝난 뒤 로그인 상태를 관찰한다.

로그인 직후:

1. Android `updates` notification channel 생성
2. 현재 권한 확인
3. 미결정 상태면 OS 권한 요청
4. 권한이 허용되면 `minimumInterval: 60`으로 task 등록
5. 거부되면 worker를 등록하지 않음

로그아웃 시 task 등록을 해제한다. 사용자가 OS 설정에서 권한을 바꿀 수 있으므로 앱 활성화 시 현재 권한과 등록 상태도 재조정한다.

### 7. foreground fallback

`AppState`가 `background`/`inactive`에서 `active`로 전환될 때 background와
같은 detector orchestrator를 foreground mode로 실행한다.

- OS 알림을 표시하지 않음
- 변경된 공지 slug마다 `refresh(feedEntrySync(slug))` 실행
- 성공한 slug만 acknowledge
- 빠른 AppState 전환은 debounce
- 앱 최초 mount와 단순 re-render에서는 중복 실행하지 않음

향후 Rusaint pipeline 결과는 typed `target`을 기존 grades·chapel
`refresh()` 요청으로 매핑한다.

### 8. notification tap

공지 알림 payload에 카테고리와 변경 slug를 넣는다. 알림 탭은 공지 화면으로
이동한다. 종료 상태에서 앱을 시작한 초기 notification response도 처리한다.

## 작업 순서

### 단계 1 — 의존성과 네이티브 설정

- SDK 56 호환 `expo-background-task`, `expo-task-manager`, `expo-notifications` 설치
- `app.config.ts`에 notifications config 추가
- 생성되는 iOS background mode와 task identifier 확인

완료 조건:

- Expo config에서 필요한 plugin/native 설정 확인
- type-check가 새 패키지 import를 해석

### 단계 2 — 순수 core와 상태 저장

- Rusaint Resource Pipeline 타입·runner·single-flight 작성
- detector state 타입과 settings key 추가
- 감지/acknowledge core를 Expo·React import 없이 유지
- 가짜 session/client/store로 실행형 check 작성

완료 조건:

- disabled pipeline은 인증하지 않음
- session 1회, client lazy 공유
- 동일 fingerprint 중복 억제
- acknowledge 실패 시 재감지
- pipeline 일부 실패가 다른 pipeline을 막지 않음

### 단계 3 — 공지 detector

- `fetchFeedEntry()` 추출
- 선택 slug, 로컬 IDs, 관찰 state 비교
- 최초 baseline, 신규 ID, 삭제 무시, 부분 실패 구현
- 공지 detector 실행형 check 작성

완료 조건:

- 첫 실행 알림 없음
- 새 ID 한 번 감지
- 동일 ID 중복 없음
- 삭제·순서 변경 알림 없음
- background에서 entity/cache 불변

### 단계 4 — background task와 알림

- global task 정의와 `src/index.tsx` 조기 import
- Android channel, 권한, task register/unregister helper
- 공지 카테고리 알림 예약과 성공 후 acknowledge
- 로그인/로그아웃 생명주기 연결

완료 조건:

- 로그인 후 권한 요청
- 허용 시 task 등록, 로그아웃 시 해제
- 한 실행의 여러 slug 변경이 공지 알림 하나로 묶임
- 등록/권한 실패가 앱 시작을 막지 않음

### 단계 5 — foreground fallback과 routing

- AppState active detector 실행
- 변경 slug만 foreground sync
- foreground에서는 OS 알림 없음
- 알림 탭 routing 연결

완료 조건:

- background에서 DB sync 없음
- active 전환 후 변경 slug만 DB sync
- 성공한 변경만 acknowledge
- rapid transitions와 task 중첩에서 중복 실행 없음

### 단계 6 — 검증

정적·결정적 검사:

- `node scripts/update-detector.check.mjs`
- `pnpm type-check`
- `pnpm lint`
- `pnpm format`
- `pnpm exec expo config --type public`

개발 빌드:

- `BackgroundTask.triggerTaskWorkerForTestingAsync()`
- iOS 실기기 background/잠금/swipe 종료/재실행
- Android background/Doze/reboot/force-stop/재실행
- 권한 허용·거부
- offline 및 부분 source 실패
- 계정 전환과 로그아웃
- foreground immediate sync와 notification tap

## 예상 변경 파일

- `package.json`
- `pnpm-lock.yaml`
- `app.config.ts`
- `src/index.tsx`
- `src/app/_layout.tsx`
- `src/shared/lib/useExpoSecureStore.ts`
- 신규 credential helper
- `src/entities/settings/model.ts`
- 신규 Rusaint detection core/runtime
- `src/entities/feed/service.ts`
- 신규 notice detector
- 신규 background task/notification helper
- `scripts/update-detector.check.mjs`

가능하면 기존 `syncEngineCore.ts`와 entity sync 계약은 변경하지 않는다.

## 위험과 중단 조건

- Expo BackgroundTask에서 Rusaint 네이티브 모듈 초기화가 실패하면 성적·채플
  detector 추가 전에 별도 실기기 spike가 필요하다. 공지 detector는 순수
  `fetch`이므로 계속 동작할 수 있다.
- 알림 권한이 거부되면 background worker를 등록하지 않고 foreground
  fallback만 유지한다.
- SSUFID 응답에 중복 ID 또는 비정상 shape가 있으면 해당 slug만 실패 처리한다.
- settings JSON이 detector state 크기를 감당하지 못한다는 측정 근거가 생길
  때만 전용 테이블 migration을 검토한다.
