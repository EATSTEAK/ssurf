import { SemesterType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';
import { db } from '@/db';
import { syncChapelInformation } from '@/db/sync/chapel';

export interface SyncChapelOptions {
  force?: boolean;
  ttlMs?: number;
}

// TODO: generalize to useSyncData
export const useSyncChapel = (
  year: number,
  semester: SemesterType,
  { force = false, ttlMs = 1000 * 60 * 60 }: SyncChapelOptions = {},
) => {
  const { chapelClient } = useRusaintApplication();
  const [isSyncing, setIsSyncing] = useState(false);

  useAsyncEffect(async () => {
    const cache = await db.query.cache.findFirst({
      where: (cache, { eq }) => eq(cache.key, `chapel.information.${year}-${semester}`),
    });
    const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;
    if (shouldRequest && chapelClient && !isSyncing) {
      setIsSyncing(true);
      await syncChapelInformation(chapelClient, year, semester);
      setIsSyncing(false);
    }
  }, [chapelClient, force, isSyncing, semester, ttlMs, year]);

  return { isSyncing };
};
