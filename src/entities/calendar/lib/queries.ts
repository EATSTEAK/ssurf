import { inArray, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';

import { calendars } from '../model';
import { useSyncCalendars } from './sync';

export const useCalendars = (studentId: string, selectedSlugs: string[]) => {
  const { isSyncing, sync, error } = useSyncCalendars(studentId);

  const { data, updatedAt } = useLiveQuery(
    selectedSlugs.length > 0
      ? db
          .select()
          .from(calendars)
          .where(inArray(calendars.slug, selectedSlugs))
          .orderBy(calendars.startsAt)
      : db
          .select()
          .from(calendars)
          .where(sql`1 = 0`),
    [selectedSlugs.join(',')],
  );

  useAsyncEffect(async () => {
    if (selectedSlugs.length > 0) {
      await sync(selectedSlugs);
    }
  }, [selectedSlugs.join(',')]);

  return { data: data ?? [], error, isSyncing, updatedAt };
};
