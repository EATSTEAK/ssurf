import { desc, inArray, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncFeed } from '@/entities/feed/lib/sync';
import { feedCalendars, feedNotices, feedSites } from '@/entities/feed/model';

export const useFeedSites = () => {
  const { data, error, updatedAt } = useLiveQuery(db.select().from(feedSites));

  return { data: data ?? [], error, updatedAt };
};

export const useFeedNoticeItems = (selectedSlugs: string[]) => {
  const { data, updatedAt } = useLiveQuery(
    selectedSlugs.length > 0
      ? db
          .select({
            author: feedNotices.author,
            createdAt: feedNotices.createdAt,
            description: feedNotices.description,
            id: feedNotices.id,
            slug: feedNotices.slug,
            title: feedNotices.title,
            updatedAt: feedNotices.updatedAt,
            url: feedNotices.url,
          })
          .from(feedNotices)
          .where(inArray(feedNotices.slug, selectedSlugs))
          .orderBy(desc(sql`coalesce(${feedNotices.updatedAt}, ${feedNotices.createdAt})`))
      : db
          .select({
            author: feedNotices.author,
            createdAt: feedNotices.createdAt,
            description: feedNotices.description,
            id: feedNotices.id,
            slug: feedNotices.slug,
            title: feedNotices.title,
            updatedAt: feedNotices.updatedAt,
            url: feedNotices.url,
          })
          .from(feedNotices)
          .where(sql`1 = 0`),
    [selectedSlugs.join(',')],
  );

  return { data: data ?? [], updatedAt };
};

export const useFeedNotices = (studentId: string, selectedSlugs: string[]) => {
  const { isSyncing, sync, error } = useSyncFeed(studentId);
  const { data, updatedAt } = useFeedNoticeItems(selectedSlugs);

  useAsyncEffect(async () => {
    if (selectedSlugs.length > 0) {
      await sync(selectedSlugs);
    }
  }, [selectedSlugs.join(',')]);

  return { data, error, isSyncing, updatedAt };
};

export const useFeedCalendars = (studentId: string, selectedSlugs: string[]) => {
  const { isSyncing, sync, error } = useSyncFeed(studentId);

  const { data, updatedAt } = useLiveQuery(
    selectedSlugs.length > 0
      ? db
          .select()
          .from(feedCalendars)
          .where(inArray(feedCalendars.slug, selectedSlugs))
          .orderBy(feedCalendars.startsAt)
      : db
          .select()
          .from(feedCalendars)
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
