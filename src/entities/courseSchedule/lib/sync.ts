import { SemesterType } from '@rusaint/react-native';

import { syncCourseSchedule } from '@/entities/courseSchedule/service';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useSyncCourseSchedule = (options?: SyncOptions) => {
  const { personalCourseScheduleClient, studentId } = useRusaintApplication();

  return useSyncData({
    client: personalCourseScheduleClient,
    studentId,
    cacheKey: ([year, semester]: [number, SemesterType]) =>
      `courseSchedule.${year}-${semester}`,
    syncFn: syncCourseSchedule,
    options,
  });
};
