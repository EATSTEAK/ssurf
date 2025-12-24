import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncScholarships } from '@/entities/scholarships/lib/useSyncScholarships';
import { ScholarshipModel } from '@/entities/scholarships/model/scholarships';

export const useScholarships = () => {
  const [data, setData] = useState<null | ScholarshipModel[]>(null);
  const { isSyncing, sync } = useSyncScholarships();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.scholarships.findMany();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};
