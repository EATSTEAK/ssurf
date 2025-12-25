import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncStudentInformation } from '@/entities/studentInformation/lib/sync';

export const useStudentInformation = () => {
  const { isSyncing, sync } = useSyncStudentInformation();

  const { data, error, updatedAt } = useLiveQuery(db.query.studentInformation.findFirst());

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data: data ?? null, isSyncing, error, updatedAt };
};
