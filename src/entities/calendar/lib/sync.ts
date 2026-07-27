import { getCalendarEntriesCacheKey, syncCalendarEntry } from '@/entities/calendar/service';
import { SyncRequest } from '@/shared/lib/syncEngine';

const GLOBAL_SCOPE = '__global__';

export const calendarEntrySync = (slug: string): SyncRequest => ({
  key: [GLOBAL_SCOPE, getCalendarEntriesCacheKey(slug)],
  run: () => syncCalendarEntry(slug),
});
