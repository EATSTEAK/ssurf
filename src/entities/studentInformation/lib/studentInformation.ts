import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncStudentInformation } from '@/entities/studentInformation/lib/useSyncStudentInformation';
import { StudentInformationModel } from '@/entities/studentInformation/model/studentInformation';

export const useStudentInformation = () => {
  const [data, setData] = useState<null | StudentInformationModel>(null);
  const { isSyncing, sync } = useSyncStudentInformation();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.studentInformation.findFirst();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};
