import { CourseType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncClassGrades } from '@/entities/grades/lib/sync/useSyncClassGrades';
import { ClassGradeModel } from '@/entities/grades/model/grades';

/**
 * 특정 학기의 과목별 성적 목록을 조회하는 훅
 * @param year 학년도
 * @param semester 학기
 * @param courseType 과정 유형
 */
export const useClassGrades = (
  year: number,
  semester: number,
  courseType: CourseType = CourseType.Bachelor,
): { data: ClassGradeModel[] | null; isSyncing: boolean } => {
  const [data, setData] = useState<ClassGradeModel[] | null>(null);
  const { isSyncing, sync } = useSyncClassGrades();

  useAsyncEffect(async () => {
    await sync([courseType, year, semester], { force: false });
    const result = await db.query.classGrades.findMany({
      where: (classGrades, { eq, and }) =>
        and(eq(classGrades.year, year), eq(classGrades.semester, semester)),
    });
    setData(result || null);
  }, [year, semester, courseType, isSyncing]);

  return { data, isSyncing };
};
