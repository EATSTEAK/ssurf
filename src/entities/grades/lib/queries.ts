import { CourseType } from '@rusaint/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { db } from '@/db';
import { classGradesSync, gradeSummarySync, semesterGradesSync } from '@/entities/grades/lib/sync';
import { ClassGradeEntity, GradeSummaryEntity, SemesterGradeEntity } from '@/entities/grades/model';
import { getEstimatedCurrentSemester, getRecentSemesters } from '@/shared/lib/semester';
import { SyncResult } from '@/shared/lib/syncEngine';
import { useSync, useSyncRequests } from '@/shared/lib/useSync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

interface SyncQueryResult {
  error: Error | undefined;
  isSyncing: boolean;
  refresh: () => Promise<SyncResult | undefined>;
  updatedAt: Date | undefined;
}

export interface UseGradeSummaryReturn extends SyncQueryResult {
  data: GradeSummaryEntity | null;
}

export const useGradeSummary = (type: 'certificated' | 'recorded'): UseGradeSummaryReturn => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(gradeSummarySync(studentId ?? '', CourseType.Bachelor));

  const { data, error, updatedAt } = useLiveQuery(
    db.query.gradeSummary.findFirst({
      where: (gradeSummary, { eq, and }) =>
        and(eq(gradeSummary.studentId, studentId ?? ''), eq(gradeSummary.type, type)),
    }),
    [studentId, type],
  );

  return {
    data: data ?? null,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};

export interface UseSemesterGradesReturn extends SyncQueryResult {
  data: SemesterGradeEntity[];
}

export const useSemesterGrades = (
  courseType: CourseType = CourseType.Bachelor,
): UseSemesterGradesReturn => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(semesterGradesSync(studentId ?? '', courseType));

  const { data, error, updatedAt } = useLiveQuery(
    db.query.semesterGrades.findMany({
      where: (semesterGrades, { eq }) => eq(semesterGrades.studentId, studentId ?? ''),
    }),
    [studentId, courseType],
  );

  return {
    data,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};

export interface UseSemesterGradeReturn extends SyncQueryResult {
  data: null | SemesterGradeEntity;
}

export const useSemesterGrade = (
  year: number,
  semester: number,
  courseType: CourseType = CourseType.Bachelor,
): UseSemesterGradeReturn => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(semesterGradesSync(studentId ?? '', courseType));

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

  return {
    data: data ?? null,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};

export interface UseClassGradesReturn extends SyncQueryResult {
  data: ClassGradeEntity[];
}

export const useClassGrades = (
  year: number,
  semester: number,
  courseType: CourseType = CourseType.Bachelor,
): UseClassGradesReturn => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(classGradesSync(studentId ?? '', courseType, year, semester));

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

  return {
    data,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};

export interface UseCheckRecentAttendedSemestersReturn {
  checkedSemesters: Array<{ attended: boolean; semester: number; year: number }>;
  error: Error | undefined;
  isChecking: boolean;
  updatedAt: Date | undefined;
}

export const useCheckRecentAttendedSemesters = (): UseCheckRecentAttendedSemestersReturn => {
  const { defaultGradesSemester, studentId } = useRusaintApplication();
  const defaultSemester = defaultGradesSemester ?? getEstimatedCurrentSemester();
  const recentTwoSemesters = useMemo(
    () => getRecentSemesters(defaultSemester, 2),
    [defaultSemester],
  );
  const sync = useSyncRequests(
    recentTwoSemesters.map((semester) =>
      classGradesSync(studentId ?? '', CourseType.Bachelor, semester.year, semester.semester),
    ),
    { sequential: true },
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
            ...recentTwoSemesters.map((semester) =>
              and(eq(classGrades.year, semester.year), eq(classGrades.semester, semester.semester)),
            ),
          ),
        ),
    }),
    [studentId, recentTwoSemesters],
  );

  const checkedSemesters = useMemo(
    () =>
      recentTwoSemesters.map((semester) => ({
        ...semester,
        attended:
          recentClasses?.some(
            (classGrade) =>
              classGrade.year === semester.year && classGrade.semester === semester.semester,
          ) ?? false,
      })),
    [recentClasses, recentTwoSemesters],
  );

  return {
    checkedSemesters,
    error: sync.error ?? error,
    isChecking: sync.isSyncing,
    updatedAt,
  };
};
