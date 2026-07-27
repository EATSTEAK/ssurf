import { desc, inArray, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import { feedEntrySync, feedSitesSync } from '@/entities/feed/lib/sync';
import { feedNotices, feedSites } from '@/entities/feed/model';
import { useSync, useSyncRequests } from '@/shared/lib/useSync';

const getUniqueSlugs = (slugs: string[]) => Array.from(new Set(slugs.filter(Boolean)));

export const useFeedSites = () => {
  const sync = useSync(feedSitesSync());
  const { data, error, updatedAt } = useLiveQuery(db.select().from(feedSites));

  return {
    data: data ?? [],
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};

export const useFeedNoticeItems = (selectedSlugs: string[]) => {
  const { data, error, updatedAt } = useLiveQuery(
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

  return { data: data ?? [], error, updatedAt };
};

export const useFeedNotices = (selectedSlugs: string[]) => {
  const slugs = getUniqueSlugs(selectedSlugs);
  const sync = useSyncRequests(slugs.map(feedEntrySync));
  const { data, error, updatedAt } = useFeedNoticeItems(slugs);

  return {
    data,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};
