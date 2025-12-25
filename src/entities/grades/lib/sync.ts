import { syncClassGrades, syncGradeSummary, syncSemesterGrades } from '@/entities/grades/service';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

/**
 * 과목별 성적 정보를 동기화하는 훅
 * 특정 학기의 과목별 성적을 가져옴
 */
export const useSyncClassGrades = (options?: SyncOptions) => {
  const { gradesClient } = useRusaintApplication();

  return useSyncData({
    client: gradesClient,
    cacheKey: ([courseType, year, semester]) => `grades.classes.${courseType}.${year}.${semester}`,
    syncFn: syncClassGrades,
    options,
  });
};

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

/**
 * 학기별 성적 정보를 동기화하는 훅
 * 학기별 성적을 가져옴
 */
export const useSyncSemesterGrades = (options?: SyncOptions) => {
  const { gradesClient } = useRusaintApplication();

  return useSyncData({
    client: gradesClient,
    cacheKey: ([courseType]) => `grades.semester.${courseType}`,
    syncFn: syncSemesterGrades,
    options,
  });
};
