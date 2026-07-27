import { inArray, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import { calendarEntrySync } from '@/entities/calendar/lib/sync';
import { calendars } from '@/entities/calendar/model';
import { useSyncRequests } from '@/shared/lib/useSync';

const getUniqueSlugs = (slugs: string[]) => Array.from(new Set(slugs.filter(Boolean)));

export const useCalendars = (selectedSlugs: string[]) => {
  const slugs = getUniqueSlugs(selectedSlugs);
  const sync = useSyncRequests(slugs.map(calendarEntrySync));

  const { data, error, updatedAt } = useLiveQuery(
    slugs.length > 0
      ? db
          .select()
          .from(calendars)
          .where(inArray(calendars.slug, slugs))
          .orderBy(calendars.startsAt)
      : db
          .select()
          .from(calendars)
          .where(sql`1 = 0`),
    [slugs.join(',')],
  );

  return {
    data: data ?? [],
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};
