import { syncClassGrades } from '@/entities/grades/api/grades';
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
