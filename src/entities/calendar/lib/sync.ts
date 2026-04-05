import { useCallback, useState } from 'react';

import { db } from '@/db';
import { FEED_SITES_CACHE_KEY, syncFeedSites } from '@/entities/feed/service';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { useSyncStore } from '@/shared/stores/syncStore';

import { getCalendarEntriesCacheKey, syncCalendarEntry } from '../service';

export interface UseSyncCalendarsOptions {
  ttlMs?: number;
}

export interface UseSyncCalendarsReturn {
  error: Error | undefined;
  isSyncing: boolean;
  sync: (selectedSlugs: string[], options?: { force?: boolean }) => Promise<void>;
  syncSites: (options?: { force?: boolean }) => Promise<void>;
}

const DEFAULT_TTL_MS = 1000 * 60 * 60;

const getUniqueSlugs = (selectedSlugs: string[]) =>
  Array.from(new Set(selectedSlugs.filter(Boolean)));

export const useSyncCalendars = (options?: UseSyncCalendarsOptions): UseSyncCalendarsReturn => {
  const { studentId } = useRusaintApplication();
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const setStoreSyncing = useSyncStore((state) => state.setIsSyncing);
  const setError = useSyncStore((state) => state.setError);

  const [lastEntryKeys, setLastEntryKeys] = useState<string[]>([]);

  const isSyncing = useSyncStore((state) =>
    lastEntryKeys.some((cacheKey) => state.syncingKeys.get(cacheKey) ?? false),
  );
  const error = useSyncStore((state) => {
    for (const cacheKey of lastEntryKeys) {
      const entryError = state.errors.get(cacheKey);
      if (entryError) {
        return entryError;
      }
    }

    return undefined;
  });

  const syncSites = useCallback(
    async (syncOptions?: { force?: boolean }) => {
      const force = syncOptions?.force ?? false;
      const cacheKey = FEED_SITES_CACHE_KEY;

      if (force) {
        setError(cacheKey, undefined);
      }

      const existingError = useSyncStore.getState().errors.get(cacheKey);
      if (existingError && !force) {
        return;
      }

      const cache = await db.query.cache.findFirst({
        where: (c, { and, eq }) => and(eq(c.studentId, '__global__'), eq(c.key, cacheKey)),
      });

      const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;
      if (!shouldRequest) {
        return;
      }

      const currentSyncing = useSyncStore.getState().syncingKeys.get(cacheKey) ?? false;
      if (currentSyncing) {
        return;
      }

      if (!studentId) {
        return;
      }

      setStoreSyncing(cacheKey, true);
      try {
        await syncFeedSites(studentId);
        setError(cacheKey, undefined);
      } catch (e) {
        setError(cacheKey, e instanceof Error ? e : new Error(String(e)));
      } finally {
        setStoreSyncing(cacheKey, false);
      }
    },
    [setError, setStoreSyncing, studentId, ttlMs],
  );

  const runSyncEntry = useCallback(
    async (slug: string, syncOptions?: { force?: boolean }, track = true) => {
      if (!slug) {
        return;
      }

      const force = syncOptions?.force ?? false;
      const cacheKey = getCalendarEntriesCacheKey(slug);

      if (track) {
        setLastEntryKeys([cacheKey]);
      }

      if (force) {
        setError(cacheKey, undefined);
      }

      const existingError = useSyncStore.getState().errors.get(cacheKey);
      if (existingError && !force) {
        return;
      }

      const cache = await db.query.cache.findFirst({
        where: (c, { and, eq }) => and(eq(c.studentId, '__global__'), eq(c.key, cacheKey)),
      });

      const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;
      if (!shouldRequest) {
        return;
      }

      const currentSyncing = useSyncStore.getState().syncingKeys.get(cacheKey) ?? false;
      if (currentSyncing) {
        return;
      }

      setStoreSyncing(cacheKey, true);
      try {
        await syncCalendarEntry(slug);
        setError(cacheKey, undefined);
      } catch (e) {
        setError(cacheKey, e instanceof Error ? e : new Error(String(e)));
      } finally {
        setStoreSyncing(cacheKey, false);
      }
    },
    [setError, setStoreSyncing, ttlMs],
  );

  const sync = useCallback(
    async (selectedSlugs: string[], syncOptions?: { force?: boolean }) => {
      const uniqueSlugs = getUniqueSlugs(selectedSlugs);
      const cacheKeys = uniqueSlugs.map(getCalendarEntriesCacheKey);

      setLastEntryKeys(cacheKeys);

      if (uniqueSlugs.length === 0) {
        return;
      }

      await Promise.all(uniqueSlugs.map((slug) => runSyncEntry(slug, syncOptions, false)));
    },
    [runSyncEntry],
  );

  return { error, isSyncing, sync, syncSites };
};
