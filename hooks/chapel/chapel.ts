import { SemesterType } from '@rusaint/react-native';
import { useEffect, useState } from 'react';

import { db } from '@/db';
import { ChapelAttendanceDto, ChapelGeneralDto } from '@/db/schema/chapel';
import { useSyncChapel } from '@/hooks/sync/useSyncChapel';

export const useGeneralChapelInformation = (year: number, semester: SemesterType) => {
  const [data, setData] = useState<ChapelGeneralDto | null>(null);
  const { isSyncing } = useSyncChapel(year, semester, {});

  useEffect(() => {
    (async () => {
      const result = await db.query.chapelGeneral.findFirst({
        where: (chapelGeneral, { eq, and }) =>
          and(eq(chapelGeneral.year, year), eq(chapelGeneral.semester, semester)),
      });
      setData(result || null);
    })();
  }, [year, semester, isSyncing]);

  return { data, isSyncing };
};

export const useChapelAttendances = (year: number, semester: SemesterType) => {
  const [data, setData] = useState<ChapelAttendanceDto[] | null>(null);
  const { isSyncing } = useSyncChapel(year, semester, {});

  useEffect(() => {
    (async () => {
      const result = await db.query.chapelAttendances.findMany({
        where: (chapelAttendances, { eq, and }) =>
          and(eq(chapelAttendances.year, year), eq(chapelAttendances.semester, semester)),
      });
      setData(result || null);
    })();
  }, [year, semester, isSyncing]);

  return { data, isSyncing };
};
