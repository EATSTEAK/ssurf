import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';
import { syncGradeSummary, syncSemesterGrades } from '@/db/sync/grades';

import { SyncOptions, useSyncData } from './index';

/**
 * 성적 요약 정보를 동기화하는 훅
 * certificated와 recorded 두 가지 타입의 성적 요약을 가져옴
 */
export const useSyncGradeSummary = (options?: SyncOptions) => {
  const { gradesClient } = useRusaintApplication();

  return useSyncData({
    client: gradesClient,
    cacheKey: 'grades.summary.certificated',
    syncFn: syncGradeSummary,
    options,
  });
};

/**
 * 특정 학기의 성적 정보를 동기화하는 훅
 * 학기별 성적과 과목별 성적을 가져옴
 */
export const useSyncSemesterGrades = (options?: SyncOptions) => {
  const { gradesClient } = useRusaintApplication();

  return useSyncData({
    client: gradesClient,
    cacheKey: ([year, semester]) => `grades.semester.${year}-${semester}`,
    syncFn: syncSemesterGrades,
    options,
  });
};
