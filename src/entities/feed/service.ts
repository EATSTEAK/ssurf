/* eslint-disable @typescript-eslint/naming-convention */
import { parseISO } from 'date-fns';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { feedNotices, feedSites } from '@/entities/feed/model';
import { cache } from '@/shared/model/schema/cache';

const SSUFID_BASE_URL = 'https://ssufid.yourssu.com';
export const FEED_SITES_CACHE_KEY = 'feed.sites';

export const getFeedEntriesCacheKey = (slug: string) => `feed.entries.${slug}`;

const inferSiteKind = (slug: string, kind?: 'calendar' | 'notice'): 'calendar' | 'notice' => {
  if (kind) {
    return kind;
  }

  return slug.includes('calendar/') ? 'calendar' : 'notice';
};

export interface SsufidSiteResponse {
  description: null | string;
  itemCount: number;
  kind?: 'calendar' | 'notice';
  slug: string;
  source: null | string;
  title: string;
}

export interface SsufidNoticeItem {
  author?: string;
  category?: string[];
  created_at: string;
  description?: string;
  id: string;
  metadata?: Record<string, unknown>;
  thumbnail?: string;
  title: string;
  updated_at?: string;
  url?: string;
}

export interface SsufidNoticeResponse {
  description?: string;
  items: SsufidNoticeItem[];
  kind: 'notice';
  slug: string;
  source?: string;
  title: string;
  updated_at: string;
  version: string;
}

export const syncFeedSites = async () => {
  const response = await fetch(`${SSUFID_BASE_URL}/sites.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sites: ${response.status}`);
  }

  const sites: SsufidSiteResponse[] = await response.json();

  await db.transaction(async (tx) => {
    for (const site of sites) {
      const kind = inferSiteKind(site.slug, site.kind);

      await tx
        .insert(feedSites)
        .values({
          slug: site.slug,
          title: site.title,
          description: site.description ?? null,
          source: site.source ?? null,
          itemCount: site.itemCount,
          kind,
        })
        .onConflictDoUpdate({
          target: feedSites.slug,
          set: {
            title: site.title,
            description: site.description ?? null,
            source: site.source ?? null,
            itemCount: site.itemCount,
            kind,
          },
        });
    }

    await tx
      .insert(cache)
      .values({
        studentId: '__global__',
        key: FEED_SITES_CACHE_KEY,
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: { updatedAt: Date.now() },
      });
  });
};

export const fetchFeedEntry = async (slug: string): Promise<SsufidNoticeResponse> => {
  const response = await fetch(`${SSUFID_BASE_URL}/${slug}/data.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${slug}: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== 'object' ||
    data === null ||
    !('items' in data) ||
    !Array.isArray(data.items) ||
    !data.items.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        typeof item.id === 'string' &&
        item.id.length > 0,
    )
  ) {
    throw new Error(`Invalid feed response for ${slug}`);
  }
  return data as SsufidNoticeResponse;
};

export const syncFeedEntry = async (slug: string) => {
  const data = await fetchFeedEntry(slug);
  const [site] = await db.select().from(feedSites).where(eq(feedSites.slug, slug));

  if ((data.kind ?? site?.kind) !== 'notice') {
    throw new Error(`Feed entry is not a notice source: ${slug}`);
  }

  const updatedAt = Date.now();

  await db.transaction(async (tx) => {
    await tx.delete(feedNotices).where(eq(feedNotices.slug, slug));

    if (data.items.length > 0) {
      const values = data.items.map((item) => ({
        author: item.author ?? null,
        categoriesJson: item.category ? JSON.stringify(item.category) : null,
        createdAt: item.created_at ? parseISO(item.created_at).getTime() : null,
        description: item.description ?? null,
        id: item.id,
        metadataJson: item.metadata ? JSON.stringify(item.metadata) : null,
        slug,
        thumbnail: item.thumbnail ?? null,
        title: item.title,
        updatedAt: item.updated_at ? parseISO(item.updated_at).getTime() : null,
        url: item.url ?? null,
      }));

      for (let i = 0; i < values.length; i += 50) {
        await tx.insert(feedNotices).values(values.slice(i, i + 50));
      }
    }

    await tx
      .insert(cache)
      .values({
        studentId: '__global__',
        key: getFeedEntriesCacheKey(slug),
        updatedAt,
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: { updatedAt },
      });
  });
};

export const syncFeedEntries = async (selectedSlugs: string[]) => {
  const uniqueSlugs = Array.from(new Set(selectedSlugs.filter(Boolean)));

  if (uniqueSlugs.length === 0) {
    return;
  }

  const failedSlugs: string[] = [];

  for (const slug of uniqueSlugs) {
    try {
      await syncFeedEntry(slug);
    } catch (error) {
      console.error(`Error syncing ${slug}:`, error);
      failedSlugs.push(slug);
    }
  }

  if (failedSlugs.length === uniqueSlugs.length) {
    throw new Error(`Failed to sync feed entries: ${failedSlugs.join(', ')}`);
  }

  if (failedSlugs.length > 0) {
    console.error(`Partially failed to sync feed entries: ${failedSlugs.join(', ')}`);
  }
};
