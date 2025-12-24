import { SemesterType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncChapel } from '@/entities/chapel/lib/sync/useSyncChapel';
import { ChapelAttendanceModel } from '@/entities/chapel/model/chapel';

export const useChapelAttendances = (year: number, semester: SemesterType) => {
  const [data, setData] = useState<ChapelAttendanceModel[] | null>(null);
  const { isSyncing, sync } = useSyncChapel();

  useAsyncEffect(async () => {
    await sync([year, semester], { force: false });
    const result = await db.query.chapelAttendances.findMany({
      where: (chapelAttendances, { eq, and }) =>
        and(eq(chapelAttendances.year, year), eq(chapelAttendances.semester, semester)),
    });
    setData(result || null);
  }, [year, semester, isSyncing]);

  return { data, isSyncing };
};
