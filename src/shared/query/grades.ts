import { CourseType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { ClassGradeDto, GradeSummaryDto, SemesterGradeDto } from '@/db/schema/grades';
import { getEstimatedCurrentSemester, getRecentSemesters } from '@/shared/lib/semester';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import {
  useSyncClassGrades,
  useSyncGradeSummary,
  useSyncSemesterGrades,
} from '@/shared/sync/useSyncGrades';

/**
 * 성적 요약 정보를 조회하는 훅
 * @param type 'certificated' (증명) 또는 'recorded' (학적부)
 */
export const useGradeSummary = (
  type: 'certificated' | 'recorded',
): { data: GradeSummaryDto | null; isSyncing: boolean } => {
  const [data, setData] = useState<GradeSummaryDto | null>(null);
  const { isSyncing, sync } = useSyncGradeSummary();

  useAsyncEffect(async () => {
    await sync([CourseType.Bachelor], { force: false });
    const result = await db.query.gradeSummary.findFirst({
      where: (gradeSummary, { eq }) => eq(gradeSummary.type, type),
    });
    setData(result || null);
  }, [type, isSyncing]);

  return { data, isSyncing };
};

/**
 * 모든 학기의 성적 정보를 조회하는 훅
 * @param courseType 과정 유형
 * @returns SemesterGradeDto[]
 */
export const useSemesterGrades = (
  courseType: CourseType = CourseType.Bachelor,
): { data: null | SemesterGradeDto[]; isSyncing: boolean } => {
  const [data, setData] = useState<null | SemesterGradeDto[]>(null);
  const { isSyncing, sync } = useSyncSemesterGrades();

  useAsyncEffect(async () => {
    await sync([courseType], { force: false });
    const result = await db.query.semesterGrades.findMany();
    setData(result || null);
  }, [courseType, isSyncing]);

  return { data, isSyncing };
};

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
): { data: null | SemesterGradeDto; isSyncing: boolean } => {
  const [data, setData] = useState<null | SemesterGradeDto>(null);
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
): { data: ClassGradeDto[] | null; isSyncing: boolean } => {
  const [data, setData] = useState<ClassGradeDto[] | null>(null);
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
