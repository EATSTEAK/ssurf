import { useState } from 'react';

import { db } from '@/db';
import { syncFeedEntries, syncFeedSites } from '@/entities/feed/service';
import { useSyncStore } from '@/shared/stores/syncStore';

export interface UseSyncFeedOptions {
  ttlMs?: number;
}

export interface UseSyncFeedReturn {
  error: Error | undefined;
  isSyncing: boolean;
  sync: (selectedSlugs: string[], options?: { force?: boolean }) => Promise<void>;
  syncSites: (options?: { force?: boolean }) => Promise<void>;
}

const DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour

export const useSyncFeed = (studentId: string, options?: UseSyncFeedOptions): UseSyncFeedReturn => {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const {
    isSyncing: getIsSyncing,
    setIsSyncing: setStoreSyncing,
    getError,
    setError,
  } = useSyncStore();

  const [lastEntriesKey, setLastEntriesKey] = useState<null | string>(null);

  const isSyncing = lastEntriesKey ? getIsSyncing(lastEntriesKey) : false;
  const error = lastEntriesKey ? getError(lastEntriesKey) : undefined;

  const syncSites = async (syncOptions?: { force?: boolean }) => {
    const force = syncOptions?.force ?? false;
    const cacheKey = 'feed.sites';


    if (force) {
      setError(cacheKey, undefined);
    }

    const existingError = getError(cacheKey);
    if (existingError && !force) {
      return;
    }

    const cache = await db.query.cache.findFirst({
      where: (c, { and, eq }) => and(eq(c.studentId, studentId), eq(c.key, cacheKey)),
    });

    const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;

    if (!shouldRequest) {
      return;
    }

    const currentSyncing = getIsSyncing(cacheKey);
    if (!currentSyncing) {
      setStoreSyncing(cacheKey, true);
      try {
        await syncFeedSites(studentId);
        setError(cacheKey, undefined);
      } catch (e) {
        setError(cacheKey, e instanceof Error ? e : new Error(String(e)));
      } finally {
        setStoreSyncing(cacheKey, false);
      }
    }
  };

  const sync = async (selectedSlugs: string[], syncOptions?: { force?: boolean }) => {
    const force = syncOptions?.force ?? false;
    const normalizedKey = [...selectedSlugs].sort().join(',');
    const cacheKey = `feed.entries.${normalizedKey}`;

    setLastEntriesKey(cacheKey);

    if (force) {
      setError(cacheKey, undefined);
    }

    const existingError = getError(cacheKey);
    if (existingError && !force) {
      return;
    }

    const cache = await db.query.cache.findFirst({
      where: (c, { and, eq }) => and(eq(c.studentId, studentId), eq(c.key, cacheKey)),
    });

    const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;

    if (!shouldRequest) {
      return;
    }

    const currentSyncing = getIsSyncing(cacheKey);
    if (!currentSyncing) {
      setStoreSyncing(cacheKey, true);
      try {
        await syncSites({ force });
        await syncFeedEntries(studentId, selectedSlugs);
        setError(cacheKey, undefined);
      } catch (e) {
        setError(cacheKey, e instanceof Error ? e : new Error(String(e)));
      } finally {
        setStoreSyncing(cacheKey, false);
      }
    }
  };

  return { error, isSyncing, sync, syncSites };
};
