import { CourseType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { ClassGradeDto, GradeSummaryDto, SemesterGradeDto } from '@/db/schema/grades';
import { useSyncGradeSummary, useSyncSemesterGrades } from '@/hooks/sync/useSyncGrades';

/**
 * 성적 요약 정보를 조회하는 훅
 * @param type 'certificated' (증명) 또는 'recorded' (학적부)
 */
export const useGradeSummary = (type: 'certificated' | 'recorded') => {
  const [data, setData] = useState<GradeSummaryDto | null>(null);
  const { isSyncing } = useSyncGradeSummary(CourseType.Bachelor);

  useAsyncEffect(async () => {
    const result = await db.query.gradeSummary.findFirst({
      where: (gradeSummary, { eq }) => eq(gradeSummary.type, type),
    });
    setData(result || null);
  }, [type, isSyncing]);

  return { data, isSyncing };
};

/**
 * 특정 학기의 성적 정보를 조회하는 훅
 * @param year 학년도
 * @param semester 학기
 */
export const useSemesterGrades = (year: number, semester: number) => {
  const [data, setData] = useState<null | SemesterGradeDto>(null);
  const { isSyncing } = useSyncSemesterGrades(CourseType.Bachelor, year, semester);

  useAsyncEffect(async () => {
    const result = await db.query.semesterGrades.findFirst({
      where: (semesterGrades, { eq, and }) =>
        and(eq(semesterGrades.year, year), eq(semesterGrades.semester, semester)),
    });
    setData(result || null);
  }, [year, semester, isSyncing]);

  return { data, isSyncing };
};

/**
 * 특정 학기의 과목별 성적 목록을 조회하는 훅
 * @param year 학년도
 * @param semester 학기
 */
export const useClassGrades = (year: number, semester: number) => {
  const [data, setData] = useState<ClassGradeDto[] | null>(null);
  const { isSyncing } = useSyncSemesterGrades(CourseType.Bachelor, year, semester);

  useAsyncEffect(async () => {
    const result = await db.query.classGrades.findMany({
      where: (classGrades, { eq, and }) =>
        and(eq(classGrades.year, year), eq(classGrades.semester, semester)),
    });
    setData(result || null);
  }, [year, semester, isSyncing]);

  return { data, isSyncing };
};
