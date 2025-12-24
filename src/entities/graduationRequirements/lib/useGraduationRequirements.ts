import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncGraduationRequirements } from '@/entities/graduationRequirements/lib/sync/useSyncGraduationRequirements';
import { GraduationRequirementModel } from '@/entities/graduationRequirements/model/graduationRequirements';

export const useGraduationRequirements = () => {
  const [data, setData] = useState<GraduationRequirementModel[] | null>(null);
  const { isSyncing, sync } = useSyncGraduationRequirements();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.graduationRequirements.findMany();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};
