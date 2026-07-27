import { db } from '@/db';
import { syncStore } from '@/shared/stores/syncStore';

import { createSyncEngine } from './syncEngineCore';

export { getSyncRequestId } from './syncEngineCore';
export type { SyncRequest, SyncResult } from './syncEngineCore';

const engine = createSyncEngine({
  getUpdatedAt: async (scope, resource) => {
    const entry = await db.query.cache.findFirst({
      where: (cache, { and, eq }) => and(eq(cache.studentId, scope), eq(cache.key, resource)),
    });

    return entry?.updatedAt;
  },
  start: (id) => syncStore.getState().start(id),
  succeed: (id) => syncStore.getState().succeed(id),
  fail: (id, error) => syncStore.getState().fail(id, error),
});

export const { ensure, refresh } = engine;
