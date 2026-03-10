import { SemesterType } from '@rusaint/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncCourseSchedule } from '@/entities/courseSchedule/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useCourseSchedule = (year: number, semester: SemesterType) => {
  const { isSyncing, sync } = useSyncCourseSchedule();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
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

  useAsyncEffect(async () => {
    await sync([year, semester], { force: false });
  }, [year, semester]);

  return { data: data ?? [], error, isSyncing, updatedAt };
};
