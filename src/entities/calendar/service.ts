/* eslint-disable @typescript-eslint/naming-convention */
import { eq, inArray } from 'drizzle-orm';

import { db } from '@/db';
import { feedSites } from '@/entities/feed/model';
import { cache } from '@/shared/model/schema/cache';

import { calendars } from './model';

const SSUFID_BASE_URL = 'https://ssufid.yourssu.com';

export const getCalendarEntriesCacheKey = (slug: string) => `calendar.entries.${slug}`;

export interface SsufidCalendarItem {
  description?: string;
  ends_at?: string;
  id: string;
  location?: string;
  starts_at: string;
  title: string;
  url?: string;
}

export interface SsufidCalendarResponse {
  description?: string;
  items: SsufidCalendarItem[];
  kind: 'calendar';
  slug: string;
  source?: string;
  title: string;
  updated_at: string;
  version: string;
}

export const syncCalendarEntry = async (studentId: string, slug: string) => {
  const response = await fetch(`${SSUFID_BASE_URL}/${slug}/data.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${slug}: ${response.status}`);
  }

  const data: SsufidCalendarResponse = await response.json();
  const [site] = await db.select().from(feedSites).where(eq(feedSites.slug, slug));

  if ((data.kind ?? site?.kind) !== 'calendar') {
    throw new Error(`Feed entry is not a calendar source: ${slug}`);
  }

  const updatedAt = Date.now();

  await db.transaction(async (tx) => {
    await tx.delete(calendars).where(inArray(calendars.slug, [slug]));

    if (data.items.length > 0) {
      const values = data.items.map((item) => ({
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
        await tx.insert(calendars).values(values.slice(i, i + 50));
      }
    }

    await tx
      .insert(cache)
      .values({
        studentId,
        key: getCalendarEntriesCacheKey(slug),
        updatedAt,
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: { updatedAt },
      });
  });
};

export const syncCalendarEntries = async (studentId: string, selectedSlugs: string[]) => {
  const uniqueSlugs = Array.from(new Set(selectedSlugs.filter(Boolean)));

  if (uniqueSlugs.length === 0) {
    return;
  }

  const failedSlugs: string[] = [];

  for (const slug of uniqueSlugs) {
    try {
      await syncCalendarEntry(studentId, slug);
    } catch (error) {
      console.error(`Error syncing ${slug}:`, error);
      failedSlugs.push(slug);
    }
  }

  if (failedSlugs.length === uniqueSlugs.length) {
    throw new Error(`Failed to sync calendar entries: ${failedSlugs.join(', ')}`);
  }

  if (failedSlugs.length > 0) {
    console.error(`Partially failed to sync calendar entries: ${failedSlugs.join(', ')}`);
  }
};
