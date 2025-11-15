import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { StudentInformationDto } from '@/db/schema/studentInformation';
import { useSyncStudentInformation } from '@/hooks/sync/useSyncStudentInformation';

export const useStudentInformation = () => {
  const [data, setData] = useState<null | StudentInformationDto>(null);
  const { isSyncing, sync } = useSyncStudentInformation();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.studentInformation.findFirst();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};
