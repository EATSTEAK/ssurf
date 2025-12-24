import { syncSemesterGrades } from '@/entities/grades/api/grades';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

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
