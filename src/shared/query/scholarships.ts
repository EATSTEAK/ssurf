import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { ScholarshipDto } from '@/db/schema/scholarships';
import { useSyncScholarships } from '@/shared/sync/useSyncScholarships';

export const useScholarships = () => {
  const [data, setData] = useState<null | ScholarshipDto[]>(null);
  const { isSyncing, sync } = useSyncScholarships();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.scholarships.findMany();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};
