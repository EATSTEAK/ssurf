import { SemesterType } from '@rusaint/react-native';

import {
  syncCourseInformation,
  syncCourseSchedule,
  syncCourseSyllabus,
} from '@/entities/courseSchedule/service';
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

export const courseInformationSync = (
  studentId: string,
  year: number,
  semester: SemesterType,
): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, `courseInformation.${year}-${semester}`],
    run: async () => {
      const [client, registrationClient] = await Promise.all([
        applications.get('courseSchedule', studentId, generation),
        applications.get('courseRegistrationStatus', studentId, generation),
      ]);
      await syncCourseInformation(client, registrationClient, studentId, year, semester);
    },
  };
};

export const courseSyllabusSync = (
  studentId: string,
  year: number,
  semester: SemesterType,
  code: string,
): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, `courseSyllabus.${year}-${semester}-${code}`],
    run: async () => {
      const client = await applications.get('courseSchedule', studentId, generation);
      await syncCourseSyllabus(client, studentId, year, semester, code);
    },
  };
};
