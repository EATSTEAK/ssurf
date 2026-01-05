import { CourseType } from '@rusaint/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo, useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import {
  useSyncClassGrades,
  useSyncGradeSummary,
  useSyncSemesterGrades,
} from '@/entities/grades/lib/sync';
import { ClassGradeEntity, GradeSummaryEntity, SemesterGradeEntity } from '@/entities/grades/model';
import { getEstimatedCurrentSemester, getRecentSemesters } from '@/shared/lib/semester';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export interface UseGradeSummaryReturn {
  data: GradeSummaryEntity | null;
  error: Error | undefined;
  isSyncing: boolean;
  updatedAt: Date | undefined;
}

/**
 * 성적 요약 정보를 조회하는 훅
 * @param type 'certificated' (증명) 또는 'recorded' (학적부)
 */
export const useGradeSummary = (type: 'certificated' | 'recorded'): UseGradeSummaryReturn => {
  const { isSyncing, sync } = useSyncGradeSummary();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.gradeSummary.findFirst({
      where: (gradeSummary, { eq, and }) =>
        and(eq(gradeSummary.studentId, studentId ?? ''), eq(gradeSummary.type, type)),
    }),
    [studentId, type],
  );

  useAsyncEffect(async () => {
    await sync([CourseType.Bachelor], { force: false });
  }, [type]);

  return { data: data ?? null, isSyncing, error, updatedAt };
};

export interface UseSemesterGradesReturn {
  data: SemesterGradeEntity[];
  error: Error | undefined;
  isSyncing: boolean;
  updatedAt: Date | undefined;
}

/**
 * 모든 학기의 성적 정보를 조회하는 훅
 * @param courseType 과정 유형
 * @returns SemesterGradeEntity[]
 */
export const useSemesterGrades = (courseType: CourseType = CourseType.Bachelor) => {
  const { isSyncing, sync } = useSyncSemesterGrades();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.semesterGrades.findMany({
      where: (semesterGrades, { eq }) => eq(semesterGrades.studentId, studentId ?? ''),
    }),
    [studentId, courseType],
  );

  useAsyncEffect(async () => {
    await sync([courseType], { force: false });
  }, [courseType]);

  return { data, isSyncing, error, updatedAt };
};

export interface UseSemesterGradeReturn {
  data: null | SemesterGradeEntity;
  error: Error | undefined;
  isSyncing: boolean;
  updatedAt: Date | undefined;
}

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
): UseSemesterGradeReturn => {
  const { isSyncing, sync } = useSyncSemesterGrades();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.semesterGrades.findFirst({
      where: (semesterGrades, { eq, and }) =>
        and(
          eq(semesterGrades.studentId, studentId ?? ''),
          eq(semesterGrades.year, year),
          eq(semesterGrades.semester, semester),
        ),
    }),
    [studentId, year, semester, courseType],
  );

  useAsyncEffect(async () => {
    await sync([courseType], { force: false });
  }, [courseType]);

  return { data: data ?? null, isSyncing, error, updatedAt };
};

export interface UseClassGradesReturn {
  data: ClassGradeEntity[];
  error: Error | undefined;
  isSyncing: boolean;
  updatedAt: Date | undefined;
}

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
): UseClassGradesReturn => {
  const { isSyncing, sync } = useSyncClassGrades();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.classGrades.findMany({
      where: (classGrades, { eq, and }) =>
        and(
          eq(classGrades.studentId, studentId ?? ''),
          eq(classGrades.year, year),
          eq(classGrades.semester, semester),
        ),
    }),
    [studentId, year, semester, courseType],
  );

  useAsyncEffect(async () => {
    await sync([courseType, year, semester], { force: false });
  }, [courseType, year, semester]);

  return { data, isSyncing, error, updatedAt };
};

export interface UseCheckRecentAttendedSemestersReturn {
  checkedSemesters: Array<{ attended: boolean; semester: number; year: number }>;
  error: Error | undefined;
  isChecking: boolean;
  updatedAt: Date | undefined;
}

/**
 * 최근 2개 학기 중 과목이 하나라도 있는 학기 이름 반환
 * @returns 과목이 있는 학기들의 YearSemester 배열
 */
export const useCheckRecentAttendedSemesters = (): UseCheckRecentAttendedSemestersReturn => {
  const { sync } = useSyncClassGrades();
  const [isChecking, setIsChecking] = useState(false);
  const { defaultGradesSemester, studentId } = useRusaintApplication();
  const defaultSemester = defaultGradesSemester ?? getEstimatedCurrentSemester();
  const recentTwoSemesters = useMemo(
    () => getRecentSemesters(defaultSemester, 2),
    [defaultSemester],
  );
  const {
    data: recentClasses,
    error,
    updatedAt,
  } = useLiveQuery(
    db.query.classGrades.findMany({
      where: (classGrades, { eq, and, or }) =>
        and(
          eq(classGrades.studentId, studentId ?? ''),
          or(
            ...recentTwoSemesters.map((sem) =>
              and(eq(classGrades.year, sem.year), eq(classGrades.semester, sem.semester)),
            ),
          ),
        ),
    }),
    [studentId, recentTwoSemesters],
  );

  const checkedSemesters: { attended: boolean; semester: number; year: number }[] = useMemo(
    () =>
      recentTwoSemesters.map((sem) => {
        const attended =
          recentClasses?.some((cls) => cls.year === sem.year && cls.semester === sem.semester) ??
          false;
        return {
          ...sem,
          attended,
        };
      }),
    [recentClasses, recentTwoSemesters],
  );

  useAsyncEffect(async () => {
    setIsChecking(true);
    for (const sem of recentTwoSemesters) {
      await sync([CourseType.Bachelor, sem.year, sem.semester], { force: false });
    }
    setIsChecking(false);
  }, [recentTwoSemesters, sync]);

  return { checkedSemesters, isChecking, error, updatedAt };
};
