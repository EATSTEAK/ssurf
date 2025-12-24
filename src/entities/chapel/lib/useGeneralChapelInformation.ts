import { SemesterType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncChapel } from '@/entities/chapel/lib/sync/useSyncChapel';
import { ChapelGeneralModel } from '@/entities/chapel/model/chapel';

export const useGeneralChapelInformation = (year: number, semester: SemesterType) => {
  const [data, setData] = useState<ChapelGeneralModel | null>(null);
  const { isSyncing, sync } = useSyncChapel();

  useAsyncEffect(async () => {
    await sync([year, semester], { force: false });
    const result = await db.query.chapelGeneral.findFirst({
      where: (chapelGeneral, { eq, and }) =>
        and(eq(chapelGeneral.year, year), eq(chapelGeneral.semester, semester)),
    });
    setData(result || null);
  }, [year, semester, isSyncing]);

  return { data, isSyncing };
};
