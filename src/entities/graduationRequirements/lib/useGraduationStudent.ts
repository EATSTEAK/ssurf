import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncGraduationRequirements } from '@/entities/graduationRequirements/lib/sync/useSyncGraduationRequirements';
import { GraduationStudentModel } from '@/entities/graduationRequirements/model/graduationRequirements';

export const useGraduationStudent = () => {
  const [data, setData] = useState<GraduationStudentModel | null>(null);
  const { isSyncing, sync } = useSyncGraduationRequirements();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.graduationStudent.findFirst();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};
