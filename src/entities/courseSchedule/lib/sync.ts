import { SemesterType } from '@rusaint/react-native';

import { syncCourseSchedule } from '@/entities/courseSchedule/service';
import { applications } from '@/shared/lib/applications';
import { SyncRequest } from '@/shared/lib/syncEngine';

export const courseScheduleSync = (
  studentId: string,
  year: number,
  semester: SemesterType,
): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, `personalCourseSchedule.${year}-${semester}`],
    run: async () => {
      const { client } = await applications.get('personalCourseSchedule', studentId, generation);
      await syncCourseSchedule(client, studentId, year, semester);
    },
  };
};
