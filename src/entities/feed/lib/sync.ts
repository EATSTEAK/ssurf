import {
  FEED_SITES_CACHE_KEY,
  getFeedEntriesCacheKey,
  syncFeedEntry,
  syncFeedSites,
} from '@/entities/feed/service';
import { SyncRequest } from '@/shared/lib/syncEngine';

const GLOBAL_SCOPE = '__global__';

export const feedSitesSync = (): SyncRequest => ({
  key: [GLOBAL_SCOPE, FEED_SITES_CACHE_KEY],
  run: syncFeedSites,
});

export const feedEntrySync = (slug: string): SyncRequest => ({
  key: [GLOBAL_SCOPE, getFeedEntriesCacheKey(slug)],
  run: () => syncFeedEntry(slug),
});
