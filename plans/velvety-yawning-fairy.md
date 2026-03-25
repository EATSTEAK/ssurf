# Context

- 사용자는 `https://ssufid.yourssu.com/sites.json` 과 각 `/{slug}/data.json` 에서 제공하는 공지사항/일정 정보를 앱 안에서 바로 볼 수 있는 `피드` 탭을 원합니다.
- 현재 앱은 `expo-router` 기반 탭 구조를 사용하며, bottom tab 등록은 `src/app/(tabs)/_layout.tsx` 에서 관리합니다.
- 코드베이스는 `SQLite/Drizzle + useLiveQuery` 로 읽고, 캐시/리프레시 UX는 `cache` 테이블과 `useSyncStore` 로 관리하는 패턴이 강합니다.
- 확정된 UX는 다음과 같습니다: 피드 탭 내부는 `공지사항` / `일정` 분리형이고, 소스 목록은 `sites.json` 전체를 가져오되 사용자가 직접 켜고 끌 수 있어야 하며, 기본 선택은 학교 공지(`scatch.ssu.ac.kr`) + 학사일정(`calendar/ssu-academic-calendar`)입니다.

# Recommended approach

1. `feed` bottom tab을 추가하고, 메인 화면은 `src/app/(tabs)/feed/index.tsx` 로 만듭니다.
2. 피드 화면은 기존 패턴을 그대로 따라 `Header`, `FloatingHeader`, `RefreshableScrollView`, `Tabs` 를 조합해 내부 탭 `공지사항` / `일정` 을 렌더링합니다.
3. 피드 헤더에 소스 설정 액션을 두고, 작은 모달 컴포넌트(예: `src/features/feed/ui/FeedSourcePickerModal.tsx`)에서 `sites.json` 전체 목록을 보여주며 multi-select 할 수 있게 합니다. 선택값은 `src/shared/lib/useExpoSecureStore.ts` 로 영속화하고, 기본값은 `['scatch.ssu.ac.kr', 'calendar/ssu-academic-calendar']` 로 둡니다.
4. `src/entities/feed/model.ts` 에 새 테이블 3개를 추가합니다.
   - `feedSites`: `slug` PK, `title`, `description`, `source`, `itemCount`, `kind`
   - `feedNotices`: `(slug, id)` PK, `title`, `description`, `content`, `url`, `createdAt`, `updatedAt`, `author`, `thumbnail`, `categoriesJson`, `attachmentsJson`, `metadataJson`
   - `feedCalendars`: `(slug, id)` PK, `title`, `description`, `startsAt`, `endsAt`, `location`, `url`
     배열/객체 필드는 초기 구현에서는 별도 정규화 없이 JSON string 으로 저장합니다.
5. `src/entities/feed/service.ts` 에 동기화 로직을 추가합니다.
   - `syncFeedSites(studentId)`: `sites.json` 을 fetch 해 사이트 메타를 upsert 합니다.
   - `syncFeedEntries(studentId, selectedSlugs)`: 선택된 slug 의 `/{slug}/data.json` 만 병렬 fetch 하고, 응답 shape 에 따라 공지/일정 테이블에 upsert 합니다.
   - `kind` 는 우선 `slug` 의 `calendar/` prefix 로 분류하고, 실제 응답 파싱 시 `starts_at` / `created_at` 필드로 한 번 더 안전하게 확인합니다.
   - 캐시 timestamp 기록 방식은 `src/entities/courseSchedule/service.ts` 처럼 `src/shared/model/schema/cache.ts` 를 재사용합니다.
6. `src/entities/feed/lib/sync.ts` 에 feed 전용 sync hook 을 만듭니다. `src/shared/lib/sync.ts` 는 Rusaint client 존재를 전제로 해서 public feed 에 바로 쓰기 어색하므로, shared abstraction 은 건드리지 않고 `useSyncStore` 와 `cache` 테이블 규칙만 그대로 따라갑니다. 이때 `studentId` 는 fetch 권한이 아니라 캐시 namespace 용도로만 사용합니다.
   - 사이트 카탈로그 cache key: `feed.sites`
   - 선택된 항목 cache key: `feed.entries.<normalized selected slugs>`
     선택 목록이 바뀌면 cache key 도 바뀌도록 해서 새 선택에 맞는 재동기화가 일어나게 합니다.
7. `src/entities/feed/lib/queries.ts` 에 `useLiveQuery + useAsyncEffect` 패턴으로 조회 훅을 만듭니다.
   - `useFeedSites()`
   - `useFeedNotices(selectedSlugs)`
   - `useFeedCalendars(selectedSlugs)`
     공지는 `updatedAt ?? createdAt` 내림차순, 일정은 `startsAt` 오름차순으로 정렬합니다.
8. `src/app/(tabs)/feed/index.tsx` 에서 화면을 완성합니다.
   - 공통 상태 처리: `src/app/(tabs)/chapel/index.tsx` 와 같은 로딩/에러/빈 상태 구조를 따릅니다.
   - 공지/일정 아이템은 `CardView` 기반 카드로 렌더링합니다.
   - 외부 링크는 `src/app/(tabs)/settings.tsx` 와 같은 `Link` 패턴으로 엽니다.
   - pull-to-refresh 시 사이트 목록과 선택된 엔트리를 모두 강제 동기화합니다.
   - 특정 탭에서 활성화된 소스가 하나도 없으면, 소스 설정을 유도하는 empty state 를 보여줍니다.
9. 모델 추가 후 `src/db/index.ts` 에 schema 를 등록하고, `drizzle.config.ts` 설정을 그대로 활용해 `src/drizzle/*` migration/snapshot 파일을 생성합니다.

# Critical files

- 수정: `src/app/(tabs)/_layout.tsx`
- 수정: `src/db/index.ts`
- 추가: `src/app/(tabs)/feed/index.tsx`
- 추가: `src/entities/feed/model.ts`
- 추가: `src/entities/feed/service.ts`
- 추가: `src/entities/feed/lib/sync.ts`
- 추가: `src/entities/feed/lib/queries.ts`
- 추가: `src/features/feed/ui/FeedSourcePickerModal.tsx`
- 생성: `src/drizzle/*` 신규 migration / snapshot 파일

# Reuse

- 탭 등록: `src/app/(tabs)/_layout.tsx`
- 내부 탭 UI: `src/shared/ui/primitives/Tabs.tsx`, `src/app/(tabs)/grades/index.tsx`
- 화면 골격/리프레시/플로팅 헤더/상태 처리: `src/app/(tabs)/chapel/index.tsx`, `src/shared/ui/containers/RefreshableScrollView.tsx`, `src/shared/ui/containers/Container.tsx`, `src/shared/ui/headers/Header.tsx`, `src/shared/ui/headers/FloatingHeader.tsx`
- 카드 UI: `src/shared/ui/containers/CardView.tsx`
- 모달/선택 리스트 패턴: `src/features/auth/ui/LogoutModal.tsx`, `src/shared/ui/primitives/ActionList.tsx`
- 캐시/동기화 규칙: `src/shared/lib/sync.ts`, `src/shared/stores/syncStore.ts`, `src/shared/model/schema/cache.ts`, `src/entities/courseSchedule/service.ts`
- 조회 패턴: `src/entities/chapel/lib/queries.ts`, `src/entities/courseSchedule/lib/queries.ts`
- 사용자 설정 영속화: `src/shared/lib/useExpoSecureStore.ts`
- 외부 링크 처리 패턴: `src/app/(tabs)/settings.tsx`

# Verification

- 데이터 계층
  - `sites.json` 이 `feedSites` 에 정상 저장되고 `kind` 분류가 맞는지 확인
  - 선택된 slug 의 `data.json` 만 fetch 되어 공지/일정 테이블에 올바르게 저장되는지 확인
  - 선택 목록을 바꾸면 cache key 가 달라져 새 동기화가 실행되는지 확인
- UI 흐름
  - 새 `피드` tab 이 bottom tabs 에 정상 노출되는지 확인
  - `공지사항` / `일정` 내부 탭 전환이 정상 동작하는지 확인
  - 소스 설정 모달에 `sites.json` 전체 목록이 보이고, 선택 상태가 앱 재시작 후에도 유지되는지 확인
  - 첫 실행 기본 선택이 `scatch.ssu.ac.kr` + `calendar/ssu-academic-calendar` 인지 확인
  - 로딩/에러/빈 상태 및 pull-to-refresh UX 확인
- 검증 명령
  - `pnpm db:generate`
  - `pnpm type-check`
  - `pnpm lint`
  - IDE diagnostics 확인
- 수동 E2E
  - 공지 카드와 일정 카드를 각각 하나 이상 열어 외부 링크 이동 확인
  - 공지 소스를 모두 끄면 올바른 empty state 가 나오는지 확인
  - 소스를 다시 켜면 앱 재시작 없이 목록이 다시 채워지는지 확인
