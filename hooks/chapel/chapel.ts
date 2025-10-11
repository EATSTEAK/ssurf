import { SemesterType } from '@rusaint/react-native';
import { use } from 'react';

import { db } from '@/db';
import { useSyncChapel } from '@/hooks/sync/useSyncChapel';

export const useGeneralChapelInformation = (year: number, semester: SemesterType) => {
  const { isSyncing } = useSyncChapel(year, semester, {});
  const data = use(
    db.query.chapelGeneral.findFirst({
      where: (chapelGeneral, { eq, and }) =>
        and(eq(chapelGeneral.year, year), eq(chapelGeneral.semester, semester)),
    }),
  );

  return { data, isSyncing };
};

export const useChapelAttendances = (year: number, semester: SemesterType) => {
  const { isSyncing } = useSyncChapel(year, semester, {});
  const data = use(
    db.query.chapelAttendances.findMany({
      where: (chapelAttendances, { eq, and }) =>
        and(eq(chapelAttendances.year, year), eq(chapelAttendances.semester, semester)),
    }),
  );

  return { data, isSyncing };
};
