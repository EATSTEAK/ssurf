import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncGraduationRequirements } from '@/entities/graduationRequirements/lib/sync/useSyncGraduationRequirements';
import { GraduationRequirementsGeneralModel } from '@/entities/graduationRequirements/model/graduationRequirements';

export const useGraduationRequirementsGeneral = () => {
  const [data, setData] = useState<GraduationRequirementsGeneralModel | null>(null);
  const { isSyncing, sync } = useSyncGraduationRequirements();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.graduationRequirementsGeneral.findFirst();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};
