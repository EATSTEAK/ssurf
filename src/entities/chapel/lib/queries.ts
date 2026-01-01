import { SemesterType } from '@rusaint/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncChapel } from '@/entities/chapel/lib/sync';

export const useChapelAttendances = (year: number, semester: SemesterType) => {
  const { isSyncing, sync } = useSyncChapel();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.chapelAttendances.findMany({
      where: (chapelAttendances, { eq, and }) =>
        and(eq(chapelAttendances.year, year), eq(chapelAttendances.semester, semester)),
    }),
    [year, semester],
  );

  useAsyncEffect(async () => {
    await sync([year, semester], { force: false });
  }, [year, semester]);

  return { data, isSyncing, error, updatedAt };
};

export const useGeneralChapelInformation = (year: number, semester: SemesterType) => {
  const { isSyncing, sync } = useSyncChapel();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.chapelGeneral.findFirst({
      where: (chapelGeneral, { eq, and }) =>
        and(eq(chapelGeneral.year, year), eq(chapelGeneral.semester, semester)),
    }),
    [year, semester],
  );

  useAsyncEffect(async () => {
    await sync([year, semester], { force: false });
  }, [year, semester]);

  return { data: data ?? null, isSyncing, error, updatedAt };
};
