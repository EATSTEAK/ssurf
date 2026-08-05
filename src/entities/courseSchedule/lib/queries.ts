import type { DetailedLecture, Lecture } from '@rusaint/react-native';

import { SemesterType } from '@rusaint/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useState } from 'react';

import { db } from '@/db';
import {
  courseInformationSync,
  courseScheduleSync,
  courseSyllabusSync,
} from '@/entities/courseSchedule/lib/sync';
import { findCourseInformation, searchCourseLectures } from '@/entities/courseSchedule/service';
import { applications } from '@/shared/lib/applications';
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

export const useCourseCatalogSearch = () => {
  const { studentId } = useRusaintApplication();

  return async (year: number, semester: SemesterType, keyword: string): Promise<Lecture[]> => {
    if (!studentId) {
      throw new Error('로그인 정보를 찾을 수 없어요.');
    }

    const client = await applications.get(
      'courseSchedule',
      studentId,
      applications.getGeneration(),
    );
    return searchCourseLectures(client, year, semester, keyword);
  };
};

export const useCourseInformationByCode = (year: number, semester: SemesterType, code: string) => {
  const { studentId } = useRusaintApplication();
  const [retryCount, setRetryCount] = useState(0);
  const requestKey = `${studentId ?? ''}:${year}:${semester}:${code}`;
  const [remote, setRemote] = useState<{
    data: DetailedLecture | null;
    error: Error | null;
    isSyncing: boolean;
    key: string;
  }>({ data: null, error: null, isSyncing: false, key: '' });
  const {
    data: cached,
    error: queryError,
    updatedAt,
  } = useLiveQuery(
    db.query.courseInformation.findFirst({
      where: (courseInformation, { and, eq }) =>
        and(
          eq(courseInformation.studentId, studentId ?? ''),
          eq(courseInformation.year, year),
          eq(courseInformation.semester, semester),
          eq(courseInformation.code, code),
        ),
    }),
    [studentId, year, semester, code],
  );

  useEffect(() => {
    if (updatedAt == null || cached || !studentId) {
      return;
    }

    let active = true;
    const generation = applications.getGeneration();
    void applications
      .get('courseSchedule', studentId, generation)
      .then((client) => findCourseInformation(client, year, semester, code))
      .then(
        (data) => {
          if (active) {
            setRemote({ data, error: null, isSyncing: false, key: requestKey });
          }
        },
        (error: unknown) => {
          if (active) {
            setRemote({
              data: null,
              error: error instanceof Error ? error : new Error(String(error)),
              isSyncing: false,
              key: requestKey,
            });
          }
        },
      );

    return () => {
      active = false;
    };
  }, [cached, code, requestKey, retryCount, semester, studentId, updatedAt, year]);

  const currentRemote = remote.key === requestKey ? remote : null;
  const data: DetailedLecture | null = cached
    ? { detail: cached.detail ?? undefined, lecture: cached.lecture }
    : (currentRemote?.data ?? null);

  return {
    data,
    error:
      queryError ??
      currentRemote?.error ??
      (studentId ? null : new Error('로그인 정보를 찾을 수 없어요.')),
    isSyncing:
      !data &&
      studentId != null &&
      (updatedAt == null || currentRemote == null || currentRemote.isSyncing),
    refresh: () => {
      setRemote({ data: null, error: null, isSyncing: true, key: requestKey });
      setRetryCount((count) => count + 1);
    },
  };
};

export const useCourseSyllabus = (year: number, semester: SemesterType, code: string) => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(courseSyllabusSync(studentId ?? '', year, semester, code));
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
