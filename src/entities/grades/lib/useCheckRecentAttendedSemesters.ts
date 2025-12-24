import { CourseType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncClassGrades } from '@/entities/grades/lib/sync/useSyncClassGrades';
import { getEstimatedCurrentSemester, getRecentSemesters } from '@/shared/lib/semester';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

/**
 * 최근 2개 학기 중 과목이 하나라도 있는 학기 이름 반환
 * @returns 과목이 있는 학기들의 YearSemester 배열
 */
export const useCheckRecentAttendedSemesters = (): {
  attendedSemesters: Array<{ semester: number; year: number }>;
  isChecking: boolean;
} => {
  const [attendedSemesters, setAttendedSemesters] = useState<
    Array<{ semester: number; year: number }>
  >([]);
  const { sync } = useSyncClassGrades();
  const [isChecking, setIsChecking] = useState(false);
  const { defaultGradesSemester } = useRusaintApplication();

  useAsyncEffect(async () => {
    const defaultSemester = defaultGradesSemester ?? getEstimatedCurrentSemester();
    const recentTwoSemesters = getRecentSemesters(defaultSemester, 2);

    const attended: Array<{ semester: number; year: number }> = [];

    setIsChecking(true);
    for (const sem of recentTwoSemesters) {
      await sync([CourseType.Bachelor, sem.year, sem.semester], { force: false });
      const classes = await db.query.classGrades.findMany({
        where: (classGrades, { eq, and }) =>
          and(eq(classGrades.year, sem.year), eq(classGrades.semester, sem.semester)),
      });

      if (classes && classes.length > 0) {
        attended.push({ semester: sem.semester, year: sem.year });
      }
    }
    setIsChecking(false);
    setAttendedSemesters(attended);
  }, []);

  return { attendedSemesters, isChecking };
};
