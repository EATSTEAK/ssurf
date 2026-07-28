# SUF-110 백그라운드 업데이트 감지 조사

- Linear: [SUF-110 백그라운드 싱크 워커 구현](https://linear.app/ssurf/issue/SUF-110/백그라운드-싱크-워커-구현)
- 조사 범위: 백그라운드에서 변경 여부만 감지하고 알림을 발송한다. 실제 SQLite 엔티티 동기화는 앱 사용 시 수행한다.
- 플랫폼 기대치: iOS와 Android가 허용하는 최선형 실행을 사용하며 정확한 실행 시각은 보장하지 않는다.

## 결론

단일 Expo BackgroundTask로 기회적 업데이트 감지를 수행하고, 앱이 다시 활성화될 때 같은 감지를 재시도하는 하이브리드 구조가 가장 적합하다.

백그라운드 태스크는 원격 fingerprint와 현재 로컬 데이터를 비교하고 새 변경이면 로컬 알림을 발송한다. 엔티티 테이블과 기존 sync cache는 수정하지 않는다. 앱이 활성화된 뒤에만 변경된 리소스의 기존 foreground sync를 실행한다.

서버 감지와 원격 푸시는 현재 저장소에 백엔드가 없고 개인화된 U-Saint 데이터를 서버에서 조회하려면 별도의 자격 증명 보관·보안 결정이 필요하므로 SUF-110 범위에서는 제외한다.

## 접근법 비교

| 접근법                             | 실용성                            | 앱 종료 상태 신뢰성                     | 구현 비용 | 판단                              |
| ---------------------------------- | --------------------------------- | --------------------------------------- | --------- | --------------------------------- |
| 기기 주기 폴링                     | 공지는 높음, 개인화 데이터는 중간 | OS 스케줄과 사용자의 강제 종료에 좌우됨 | 중간      | 단독 사용 시 앱 복귀 전 누락 가능 |
| 서버 감지 + 원격 푸시              | 현재 저장소에서는 낮음            | 일반 visible push가 가장 강함           | 매우 큼   | 이번 이슈에는 과설계              |
| 백그라운드 감지 + 앱 재개 fallback | 가장 높음                         | 사전 알림은 최선형, 앱 복귀 시 재검사   | 중간      | 권장                              |

### 기기 주기 폴링

`expo-background-task`는 Android WorkManager와 iOS BGTaskScheduler를 사용한다. `minimumInterval`은 실행 시각이 아니라 최소 간격이다. Android의 주기 작업 최소값은 15분이며 Doze/App Standby가 실행과 네트워크를 지연할 수 있다. iOS는 배터리, 네트워크, 앱 사용 패턴에 따라 실행 시점을 정하며 짧은 간격 요청을 크게 늦출 수 있다.

사용자가 iOS 앱 전환기에서 앱을 종료하거나 Android 설정에서 강제 종료하면 앱을 다시 열기 전까지 실행을 기대할 수 없다. 따라서 이 접근은 적시 알림이 아니라 stale-tolerant 감지에만 적합하다.

### 서버 감지 + 원격 푸시

서버가 변경을 이미 알고 있다면 일반 visible push가 가장 단순하고 강한 전송 방식이다. silent/data push는 기기에서 추가 로직이 꼭 필요할 때만 사용해야 하며 iOS throttling과 Android Doze 때문에 보장 수단이 아니다.

현재 저장소에는 서버/API 구현이 없다. 공지처럼 전역 공개 데이터는 서버에서 한 번 감지할 수 있지만, 성적과 채플은 사용자별 U-Saint 인증이 필요하다. 대학 계정 비밀번호를 서버에 저장하는 구조는 별도의 보안·개인정보 제품 결정 없이는 도입하면 안 된다.

### 하이브리드

백그라운드 태스크가 가능한 시점에 감지와 알림을 수행하고, `AppState`가 `active`로 돌아올 때 같은 감지를 재시도한다. OS가 백그라운드 실행을 건너뛰어도 사용자가 앱으로 복귀하면 확인할 수 있다. 실제 데이터 적용은 foreground에서 기존 sync path를 사용한다.

## 현재 저장소 분석

### 기존 sync는 감지가 아니라 쓰기 엔진이다

`SyncRequest.run()`은 `Promise<void>`이며 `ensure()`와 `refresh()`는 TTL과 중복 실행을 관리한 뒤 요청을 실행한다.

- `src/shared/lib/syncEngineCore.ts:1-76`
- `src/shared/lib/syncEngine.ts:1-22`
- `src/shared/lib/useSync.ts:1-60`

대상 엔티티 서비스는 원격 데이터를 읽은 다음 SQLite 행을 삭제·재삽입하고 cache timestamp를 갱신한다.

- 공지: `src/entities/feed/service.ts:103-153`
- 채플: `src/entities/chapel/service.ts:8-97`
- 학기/과목 성적: `src/entities/grades/service.ts:88-217`

따라서 기존 `ensure()` 또는 `refresh()`를 백그라운드 worker에서 직접 호출하면 “감지만 하고 실제 sync는 앱 사용 시 수행”한다는 범위를 위반한다. 감지 계층은 sync engine과 분리해야 한다.

### 현재 cache timestamp는 원격 버전이 아니다

`cache.updatedAt`은 로컬 sync가 성공한 시간이다. 원격 데이터의 변경 여부를 나타내지 않는다.

- `src/shared/model/schema/cache.ts:4-12`
- `src/entities/grades/service.ts:131-147`
- `src/entities/chapel/service.ts:80-96`

TTL cache와 알림 dedupe 상태를 같은 의미로 취급하면 안 된다.

### 인증과 애플리케이션 런타임이 React에 묶여 있다

자격 증명은 SecureStore의 `user-info`에 저장되지만 현재 접근 API는 React hook이다.

- `src/shared/providers/RusaintSessionProvider.tsx:33-117`
- `src/shared/lib/useExpoSecureStore.ts:23-80`

현재 세션 생성 이후 `applications.start()`가 여섯 애플리케이션 클라이언트를 직렬로 초기화한다.

- `src/shared/lib/applications.ts:124-207`

TaskManager가 헤드리스로 JS bundle을 시작할 때 Provider는 마운트되지 않는다. worker는 비-hook SecureStore reader로 자격 증명을 읽고, 세션을 한 번 만든 뒤 활성화된 카테고리에 필요한 Rusaint 클라이언트만 직접 생성해야 한다.

기본 SecureStore 접근성은 iOS 잠금 상태에서 읽지 못할 수 있다. 이는 최선형 실패로 처리하고 자격 증명 보호 수준을 자동으로 낮추지 않는다.

### 알림 설정 UI는 준비돼 있다

학생별 알림 토글 네 개가 있고 기본값은 모두 `true`다.

- `notifications.courseGrade.enabled`
- `notifications.semesterGrade.enabled`
- `notifications.chapel.enabled`
- `notifications.notice.enabled`

관련 코드:

- `src/entities/settings/model.ts:17-39`
- `src/entities/settings/service.ts:20-33`
- `src/app/(tabs)/settings/notifications.tsx:37-79`

`getSettingSnapshot()`은 hook이 아니므로 background code에서 재사용할 수 있다. 다만 OS 알림 권한 요청, Android 채널, worker 등록, 실제 알림 발송은 아직 없다.

### 필요한 Expo 패키지가 없다

현재 직접 의존성에는 다음 패키지가 없다.

- `expo-background-task`
- `expo-task-manager`
- `expo-notifications`

관련 코드:

- `package.json:22-70`
- `app.config.ts:43-76`

프로젝트가 Expo prebuild를 사용하므로 config plugin/CNG가 iOS background task identifier와 background mode를 생성하도록 하는 것이 적합하다.

### 리소스별 감지 준비도

#### 공지

`https://ssufid.yourssu.com/<slug>/data.json` 응답은 `version`과 `updated_at`을 제공한다.

- `src/entities/feed/service.ts:44-53`

현재 sync는 이 값을 저장하지 않는다. 감지 구현은 원격 공지 항목을 정규화해 로컬 `feedNotices`와 비교하거나, foreground 적용 version을 별도 metadata로 기록해야 한다. 공지가 가장 구현 준비도가 높다.

#### 채플

현재 fresh data 조회는 `lookup()` 후 `information(year, semester)` 전체 응답을 읽는다.

- `src/entities/chapel/service.ts:8-97`

원격 버전 API가 없으므로 의미 있는 필드를 정규화해 로컬 chapel rows와 비교해야 한다. 출석 상태 변경, 정정, 삭제 중 무엇을 알릴지 제품 규칙이 필요하다.

#### 과목별 성적

현재 fresh data 조회는 `lookup()` 후 `classes(courseType, year, semester, true)`를 호출한다.

- `src/entities/grades/service.ts:150-217`

신규 성적 공개만 알릴지, 점수·등수·상세 변경과 삭제도 알릴지 정해야 한다.

#### 학기별 성적

현재 학기 데이터는 `semesters(courseType)` 전체 목록을 읽으며 필요하면 `reload()`를 수행한다.

- `src/entities/grades/service.ts:88-148`

GPA, 취득학점, 순위, 학사경고 등 어떤 필드 변경을 알릴지 정해야 한다.

## 권장 구현 구조

### 1. 태스크 하나만 등록

`TaskManager.defineTask()`는 모듈 최상위에서 실행되어야 한다. 신규 task 모듈을 `src/index.tsx`에서 Router보다 먼저 side-effect import한다.

카테고리별로 여러 태스크를 등록하지 않는다. Expo는 여러 JS task가 하나의 네이티브 worker를 공유하고 마지막 등록이 worker interval에 영향을 줄 수 있다. 하나의 worker가 활성화된 카테고리를 순차 검사하면 충분하다.

### 2. 순수 감지 계층

감지 계층의 계약은 다음과 같아야 한다.

```text
입력: 계정, 활성화 카테고리, 로컬 적용 상태
출력: 변경된 카테고리와 원격 fingerprint
부작용: 원격 조회와 알림 dedupe metadata 기록만 허용
금지: 엔티티 테이블 및 기존 sync cache 수정
```

기존 `SyncRequest`에 probe/result 추상화를 추가하지 않는다. 기존 engine은 쓰기 sync라는 단순한 역할을 유지한다.

### 3. fingerprint와 중복 알림

각 원격 payload에서 표시 순서, 일시적인 필드 등 의미 없는 차이를 제거한 canonical value를 만들고 fingerprint를 계산한다. 적용 기준은 현재 SQLite 엔티티에서 계산하고, 마지막으로 알린 원격 fingerprint만 계정·카테고리별로 저장한다.

작은 metadata 몇 개뿐이므로 우선 기존 범용 `settings` 테이블을 사용한다. 별도 snapshot table과 migration은 조회·보존 요구가 실제로 커질 때 추가한다.

규칙:

1. 원격 fingerprint와 로컬 fingerprint가 같으면 알리지 않는다.
2. 다르고 이전에 알린 fingerprint와도 다르면 한 번 알린다.
3. 원격 fingerprint가 이전 알림과 같으면 중복 알림을 생략한다.
4. foreground sync 후 로컬 fingerprint가 원격과 같아지면 다음 변경을 정상 감지할 수 있다.

### 4. 헤드리스 인증

기존 SecureStore key를 상수화하고 hook과 background task가 공유하는 비-hook reader를 만든다.

worker 실행 시:

1. 자격 증명 확인
2. 학생별 설정 확인
3. 세션 한 번 생성
4. 공지는 `fetch`만 사용
5. 개인화 카테고리가 활성화된 경우에만 Chapel/CourseGrades client 생성
6. 네트워크·로그인·잠금 실패 시 기존 fingerprint를 보존하고 실패 반환

전체 `applications.start()`는 호출하지 않는다.

### 5. 알림 권한과 등록

권한은 foreground의 설명 가능한 사용자 동작에서 요청한다. 알림 설정에서 기능을 처음 켤 때 다음을 수행한다.

1. Android 업데이트 채널 생성
2. OS 알림 권한 요청
3. 권한이 있고 지원 카테고리가 하나 이상 활성화된 경우 worker 등록

로그아웃 또는 모든 지원 카테고리 비활성화 시 worker 등록과 계정별 dedupe metadata를 정리한다.

### 6. AppState fallback

`AppState`가 background/inactive에서 active로 전환될 때 동일한 감지 함수를 호출한다. 빠른 상태 전환과 background worker 중첩은 모듈 단위 single-flight와 짧은 debounce로 막는다.

변경이 발견되면 foreground에서 해당 리소스의 기존 `refresh()`만 실행한다. 모든 엔티티를 일괄 sync하지 않는다.

### 7. 알림 동작

한 worker 실행에서 발견된 변경은 기본적으로 알림 하나로 묶는 것이 가장 덜 시끄럽다. payload에 변경 카테고리를 넣고 탭하면 해당 화면으로 이동한다. 종료 상태에서 알림을 눌러 앱을 연 경우를 위해 startup에서 초기 notification response도 읽어야 한다.

## 예상 파일 단위 작업

- `package.json`, `pnpm-lock.yaml`: SDK 56 호환 Expo 패키지 설치
- `app.config.ts`: notifications/background task 생성 설정
- `src/index.tsx`: task 모듈 조기 import
- 신규 task 모듈: module-scope task 정의와 등록/해제
- 신규 detector 모듈: 카테고리 감지, fingerprint, single-flight
- SecureStore helper: hook 밖 자격 증명 읽기
- 대상 entity service: 필요한 경우 remote fetch와 SQLite write 경계만 분리
- `src/app/_layout.tsx`: migration 완료 후 등록과 AppState fallback
- `src/app/(tabs)/settings/notifications.tsx`: 권한 요청과 권한 상태 표시
- `scripts/update-detector.check.mjs`: `node:assert/strict` 기반 최소 검증

## 하지 않을 것

- 새 서버, token registry, cron, queue, 대학 계정 credential vault
- 생산자 없는 silent/data push
- 정확한 15분 실행 또는 guaranteed background sync 약속
- background worker에서 엔티티 테이블과 sync cache 수정
- 로그인 시 모든 entity/client 선행 초기화
- 범용 scheduler, event bus, detector registry, retry framework
- SecureStore 접근성 자동 완화
- 같은 미적용 변경에 대한 반복 알림

## 검증 계획

### 결정적 검증

기존 `scripts/sync-engine.check.mjs` 패턴을 따라 작은 실행형 check를 추가한다.

- 동일 fingerprint: 알림 없음
- 새 fingerprint: 알림 한 번
- 같은 새 fingerprint 재실행: 중복 없음
- foreground 적용 후 다음 변경: 다시 한 번 알림
- 학생·카테고리 분리
- 비활성 카테고리 skip
- detector 오류 시 기존 metadata 보존
- background 전후 엔티티와 sync cache 불변

정적 검증:

- `pnpm type-check`
- `pnpm lint`
- `pnpm format`
- `pnpm exec expo config --type public`

### 개발 빌드와 실기기

Expo Go가 아니라 development build를 사용한다. iOS BGTaskScheduler는 실기기에서 검증한다.

- `BackgroundTask.triggerTaskWorkerForTestingAsync()` 강제 실행
- iOS: foreground/background, 화면 잠금, 시스템 종료, 사용자 swipe 종료 후 재실행
- Android: background, recent 제거, 재부팅, Doze, Settings force-stop 후 재실행
- 알림 권한 허용·거부
- offline, 만료/잘못된 자격 증명
- 빠른 AppState 전환과 worker 중첩
- 계정 전환과 로그아웃
- 알림 탭의 foreground/terminated routing

강제 실행은 코드 경로만 증명하므로 실제 대기·배터리·Doze 환경의 soak test도 필요하다.

## 공식 근거

- [Expo BackgroundTask SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/background-task/)
- [Expo TaskManager SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/task-manager/)
- [Expo Notifications SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/)
- [Expo BackgroundFetch deprecation](https://docs.expo.dev/versions/latest/sdk/background-fetch/)
- [Android WorkManager periodic work](https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work)
- [Android Doze and App Standby](https://developer.android.com/training/monitoring-device-state/doze-standby)
- [Apple Background Tasks](https://developer.apple.com/documentation/uikit/using-background-tasks-to-update-your-app)
- [Apple background notification limits](https://developer.apple.com/documentation/usernotifications/pushing-background-updates-to-your-app)

## 구현 전 결정 사항

1. 네 카테고리를 한 번에 지원할지, 공지부터 단계적으로 적용할지
2. 카테고리별 의미 있는 변경 규칙
3. 앱 복귀 시 변경 리소스를 즉시 sync할지, 해당 화면 진입까지 미룰지
4. 알림을 실행 단위로 묶을지 카테고리별로 보낼지
5. worker interval 힌트와 제품 문구

플랫폼 구조와 저장소 통합 방향에 대한 확신도는 높다. 개인화 데이터의 fingerprint 규칙과 Rusaint 네이티브 클라이언트의 실제 headless 실행은 구현 및 실기기 검증이 필요한 잔여 위험이다.
