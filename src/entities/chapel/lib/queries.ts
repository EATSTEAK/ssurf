import { SemesterType } from '@rusaint/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import { chapelSync } from '@/entities/chapel/lib/sync';
import { useSync } from '@/shared/lib/useSync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useChapelAttendances = (year: number, semester: SemesterType) => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(chapelSync(studentId ?? '', year, semester));

  const { data, error, updatedAt } = useLiveQuery(
    db.query.chapelAttendances.findMany({
      where: (chapelAttendances, { eq, and }) =>
        and(
          eq(chapelAttendances.studentId, studentId ?? ''),
          eq(chapelAttendances.year, year),
          eq(chapelAttendances.semester, semester),
        ),
    }),
    [studentId, year, semester],
  );

  return {
    data,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};

export const useGeneralChapelInformation = (year: number, semester: SemesterType) => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(chapelSync(studentId ?? '', year, semester));

  const { data, error, updatedAt } = useLiveQuery(
    db.query.chapelGeneral.findFirst({
      where: (chapelGeneral, { eq, and }) =>
        and(
          eq(chapelGeneral.studentId, studentId ?? ''),
          eq(chapelGeneral.year, year),
          eq(chapelGeneral.semester, semester),
        ),
    }),
    [studentId, year, semester],
  );

  return {
    data: data ?? null,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};
