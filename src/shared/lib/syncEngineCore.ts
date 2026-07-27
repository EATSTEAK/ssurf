export type SyncRequest = {
  key: readonly [scope: string, resource: string];
  run: () => Promise<void>;
  ttlMs?: number;
};

export type SyncResult = 'failed' | 'fresh' | 'synced';

export const DEFAULT_SYNC_TTL_MS = 60 * 60 * 1000;

export const getSyncRequestId = (request: Pick<SyncRequest, 'key'>) => JSON.stringify(request.key);

export type SyncEngineDependencies = {
  fail: (id: string, error: Error) => void;
  getUpdatedAt: (scope: string, resource: string) => Promise<null | number | undefined>;
  now?: () => number;
  start: (id: string) => void;
  succeed: (id: string) => void;
};

const toError = (error: unknown) => (error instanceof Error ? error : new Error(String(error)));

export const createSyncEngine = ({
  fail,
  getUpdatedAt,
  now = Date.now,
  start,
  succeed,
}: SyncEngineDependencies) => {
  const inFlight = new Map<string, Promise<SyncResult>>();

  const isFresh = async (request: SyncRequest) => {
    const ttlMs = request.ttlMs ?? DEFAULT_SYNC_TTL_MS;
    if (ttlMs <= 0) {
      return false;
    }

    const [scope, resource] = request.key;
    const updatedAt = await getUpdatedAt(scope, resource);
    return updatedAt != null && now() - updatedAt <= ttlMs;
  };

  const execute = (request: SyncRequest, force: boolean): Promise<SyncResult> => {
    const id = getSyncRequestId(request);
    const running = inFlight.get(id);
    if (running) {
      return running;
    }

    const job = Promise.resolve()
      .then(async (): Promise<SyncResult> => {
        try {
          if (!force && (await isFresh(request))) {
            return 'fresh';
          }

          start(id);
          await request.run();
          succeed(id);
          return 'synced';
        } catch (error) {
          fail(id, toError(error));
          return 'failed';
        }
      })
      .finally(() => inFlight.delete(id));

    inFlight.set(id, job);
    return job;
  };

  return {
    ensure: (request: SyncRequest) => execute(request, false),
    refresh: (request: SyncRequest) => execute(request, true),
  };
};
