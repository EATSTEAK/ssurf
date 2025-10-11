import { SemesterType } from '@rusaint/react-native';
import { useEffect, useState } from 'react';

import { useRusaint } from '@/components/providers/RusaintProvider';
import { db } from '@/db';
import { syncChapelInformation } from '@/db/sync/chapel';

export interface SyncChapelOptions {
  force?: boolean;
  ttlMs?: number;
}

export const useSyncChapel = (
  year: number,
  semester: SemesterType,
  { force = false, ttlMs = 1000 * 60 * 60 }: SyncChapelOptions = {},
) => {
  const { chapelClient } = useRusaint();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    (async () => {
      const cache = await db.query.cache.findFirst({
        where: (cache, { eq }) => eq(cache.key, `chapel.information.${year}-${semester}`),
      });
      const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;
      if (shouldRequest && chapelClient && !isSyncing) {
        setIsSyncing(true);
        await syncChapelInformation(chapelClient, year, semester);
        setIsSyncing(false);
      }
    })();
  }, [chapelClient, force, isSyncing, semester, ttlMs, year]);

  return { isSyncing };
};
