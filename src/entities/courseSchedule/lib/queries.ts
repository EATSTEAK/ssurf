import { SemesterType } from '@rusaint/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import { courseScheduleSync } from '@/entities/courseSchedule/lib/sync';
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
