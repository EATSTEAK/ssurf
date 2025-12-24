import { syncGradeSummary } from '@/entities/grades/api/grades';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

/**
 * 성적 요약 정보를 동기화하는 훅
 * certificated와 recorded 두 가지 타입의 성적 요약을 가져옴
 */
export const useSyncGradeSummary = (options?: SyncOptions) => {
  const { gradesClient } = useRusaintApplication();

  return useSyncData({
    client: gradesClient,
    cacheKey: ([courseType]) => `grades.summary.${courseType}`,
    syncFn: syncGradeSummary,
    options,
  });
};
