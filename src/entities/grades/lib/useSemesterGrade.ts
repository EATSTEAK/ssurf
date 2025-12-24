import { CourseType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncSemesterGrades } from '@/entities/grades/lib/sync/useSyncSemesterGrades';
import { SemesterGradeModel } from '@/entities/grades/model/grades';

/**
 * 특정 학기의 성적 정보를 조회하는 훅
 * @param year 학년도
 * @param semester 학기
 * @param courseType 과정 유형
 */
export const useSemesterGrade = (
  year: number,
  semester: number,
  courseType: CourseType = CourseType.Bachelor,
): { data: null | SemesterGradeModel; isSyncing: boolean } => {
  const [data, setData] = useState<null | SemesterGradeModel>(null);
  const { isSyncing, sync } = useSyncSemesterGrades();

  useAsyncEffect(async () => {
    await sync([courseType], { force: false });
    const result = await db.query.semesterGrades.findFirst({
      where: (semesterGrades, { eq, and }) =>
        and(eq(semesterGrades.year, year), eq(semesterGrades.semester, semester)),
    });
    setData(result || null);
  }, [year, semester, courseType, isSyncing]);

  return { data, isSyncing };
};
