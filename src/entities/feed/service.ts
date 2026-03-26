/* eslint-disable @typescript-eslint/naming-convention */
import { eq, inArray } from 'drizzle-orm';

import { db } from '@/db';
import { feedCalendars, feedNotices, feedSites } from '@/entities/feed/model';
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
  attachments?: Array<{ name?: string; url?: string }>;
  author?: string;
  category?: string[];
  content?: string;
  created_at: string;
  description?: string;
  id: string;
  metadata?: Record<string, unknown>;
  thumbnail?: string;
  title: string;
  updated_at?: string;
  url?: string;
}

export interface SsufidCalendarItem {
  description?: string;
  ends_at?: string;
  id: string;
  location?: string;
  starts_at: string;
  title: string;
  url?: string;
}

export interface SsufidDataResponse {
  description?: string;
  items: SsufidCalendarItem[] | SsufidNoticeItem[];
  kind: 'calendar' | 'notice';
  slug: string;
  source?: string;
  title: string;
  updated_at: string;
  version: string;
}

export const syncFeedSites = async (studentId: string) => {
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
        studentId,
        key: FEED_SITES_CACHE_KEY,
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: { updatedAt: Date.now() },
      });
  });
};

export const syncFeedEntry = async (studentId: string, slug: string) => {
  const response = await fetch(`${SSUFID_BASE_URL}/${slug}/data.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${slug}: ${response.status}`);
  }

  const data: SsufidDataResponse = await response.json();
  const [site] = await db.select().from(feedSites).where(eq(feedSites.slug, slug));
  const kind = data.kind ?? site?.kind ?? 'notice';
  const updatedAt = Date.now();

  await db.transaction(async (tx) => {
    await tx.delete(feedNotices).where(inArray(feedNotices.slug, [slug]));
    await tx.delete(feedCalendars).where(inArray(feedCalendars.slug, [slug]));

    if (kind === 'notice') {
      const noticeItems = data.items as SsufidNoticeItem[];
      if (noticeItems.length > 0) {
        const values = noticeItems.map((item) => ({
          slug,
          id: item.id,
          title: item.title,
          description: item.description ?? null,
          content: item.content ?? null,
          url: item.url ?? null,
          createdAt: item.created_at ? new Date(item.created_at).getTime() : null,
          updatedAt: item.updated_at ? new Date(item.updated_at).getTime() : null,
          author: item.author ?? null,
          thumbnail: item.thumbnail ?? null,
          categoriesJson: item.category ? JSON.stringify(item.category) : null,
          attachmentsJson: item.attachments ? JSON.stringify(item.attachments) : null,
          metadataJson: item.metadata ? JSON.stringify(item.metadata) : null,
        }));

        for (let i = 0; i < values.length; i += 50) {
          await tx.insert(feedNotices).values(values.slice(i, i + 50));
        }
      }
    } else {
      const calendarItems = data.items as SsufidCalendarItem[];
      if (calendarItems.length > 0) {
        const values = calendarItems.map((item) => ({
          slug,
          id: item.id,
          title: item.title,
          description: item.description ?? null,
          startsAt: item.starts_at ? new Date(item.starts_at).getTime() : null,
          endsAt: item.ends_at ? new Date(item.ends_at).getTime() : null,
          location: item.location ?? null,
          url: item.url ?? null,
        }));

        for (let i = 0; i < values.length; i += 50) {
          await tx.insert(feedCalendars).values(values.slice(i, i + 50));
        }
      }
    }

    await tx
      .insert(cache)
      .values({
        studentId,
        key: getFeedEntriesCacheKey(slug),
        updatedAt,
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: { updatedAt },
      });
  });
};

export const syncFeedEntries = async (studentId: string, selectedSlugs: string[]) => {
  const uniqueSlugs = Array.from(new Set(selectedSlugs.filter(Boolean)));

  if (uniqueSlugs.length === 0) {
    return;
  }

  const failedSlugs: string[] = [];

  for (const slug of uniqueSlugs) {
    try {
      await syncFeedEntry(studentId, slug);
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
