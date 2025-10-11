import { SemesterType } from '@rusaint/react-native';
import { use, useEffect, useState } from 'react';

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
  { force = false, ttlMs = 1000 * 60 * 60 }: SyncChapelOptions,
) => {
  const { chapelClient } = useRusaint();
  const [isSyncing, setIsSyncing] = useState(false);
  const cache = use(
    db.query.cache.findFirst({
      with: { key: `chapel.information.${year}-${semester}` },
    }),
  );
  const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;

  useEffect(() => {
    if (shouldRequest && chapelClient && !isSyncing) {
      setIsSyncing(true);
      syncChapelInformation(chapelClient, year, semester).then(() => {
        setIsSyncing(false);
      });
    }
  }, [chapelClient, isSyncing, semester, shouldRequest, year]);

  return { isSyncing };
};
