import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncScholarships } from '@/entities/scholarships/lib/sync';

export const useScholarships = () => {
  const { isSyncing, sync } = useSyncScholarships();

  const { data, error, updatedAt } = useLiveQuery(db.query.scholarships.findMany());

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data, isSyncing, error, updatedAt };
};
