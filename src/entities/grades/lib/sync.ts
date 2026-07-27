import { CourseType } from '@rusaint/react-native';

import { syncClassGrades, syncGradeSummary, syncSemesterGrades } from '@/entities/grades/service';
import { applications } from '@/shared/lib/applications';
import { SyncRequest } from '@/shared/lib/syncEngine';

export const classGradesSync = (
  studentId: string,
  courseType: CourseType,
  year: number,
  semester: number,
): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, `grades.classes.${courseType}.${year}.${semester}`],
    run: async () => {
      const { client } = await applications.get('grades', studentId, generation);
      await syncClassGrades(client, studentId, courseType, year, semester);
    },
  };
};

export const gradeSummarySync = (
  studentId: string,
  courseType: CourseType,
  withReload = false,
): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, `grades.summary.${courseType}`],
    run: async () => {
      const { client } = await applications.get('grades', studentId, generation);
      await syncGradeSummary(client, studentId, courseType, withReload);
    },
  };
};

export const semesterGradesSync = (studentId: string, courseType: CourseType): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, `grades.semester.${courseType}`],
    run: async () => {
      const { client } = await applications.get('grades', studentId, generation);
      await syncSemesterGrades(client, studentId, courseType);
    },
  };
};
