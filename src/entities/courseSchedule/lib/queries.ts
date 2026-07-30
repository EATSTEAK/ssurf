import { SemesterType } from '@rusaint/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import {
  courseInformationSync,
  courseScheduleSync,
  courseSyllabusSync,
} from '@/entities/courseSchedule/lib/sync';
import { useSync } from '@/shared/lib/useSync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useCourseSchedule = (year: number, semester: SemesterType) => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(courseScheduleSync(studentId ?? '', year, semester));

  const {
    data,
    error: queryError,
    updatedAt,
  } = useLiveQuery(
    db.query.courseSchedule.findMany({
      where: (courseSchedule, { and, eq }) =>
        and(
          eq(courseSchedule.studentId, studentId ?? ''),
          eq(courseSchedule.year, year),
          eq(courseSchedule.semester, semester),
        ),
    }),
    [studentId, year, semester],
  );

  return {
    data: data ?? [],
    error: sync.error ?? queryError,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};

export const useCourseInformationSync = (year: number, semester: SemesterType) => {
  const { studentId } = useRusaintApplication();
  return useSync(courseInformationSync(studentId ?? '', year, semester));
};

export const useCourseInformationCandidates = (year: number, semester: SemesterType) => {
  const { studentId } = useRusaintApplication();
  const sync = useCourseInformationSync(year, semester);
  const cacheKey = `courseInformation.${year}-${semester}`;
  const { data, error: queryError } = useLiveQuery(
    db.query.courseInformation.findMany({
      where: (courseInformation, { and, eq }) =>
        and(
          eq(courseInformation.studentId, studentId ?? ''),
          eq(courseInformation.year, year),
          eq(courseInformation.semester, semester),
        ),
    }),
    [studentId, year, semester],
  );
  const { data: cacheEntry, error: cacheError } = useLiveQuery(
    db.query.cache.findFirst({
      where: (cache, { and, eq }) =>
        and(eq(cache.studentId, studentId ?? ''), eq(cache.key, cacheKey)),
    }),
    [studentId, cacheKey],
  );

  return {
    data: data ?? [],
    error: sync.error ?? queryError ?? cacheError,
    hasLoaded: cacheEntry?.updatedAt != null,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
  };
};

export const useCourseSyllabus = (
  year: number,
  semester: SemesterType,
  code: string,
  name: string,
) => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(courseSyllabusSync(studentId ?? '', year, semester, code, name));
  const { data, error: queryError } = useLiveQuery(
    db.query.courseSyllabus.findFirst({
      where: (courseSyllabus, { and, eq }) =>
        and(
          eq(courseSyllabus.studentId, studentId ?? ''),
          eq(courseSyllabus.year, year),
          eq(courseSyllabus.semester, semester),
          eq(courseSyllabus.code, code),
        ),
    }),
    [studentId, year, semester, code],
  );

  return {
    data: data?.data ?? null,
    error: sync.error ?? queryError,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
  };
};
