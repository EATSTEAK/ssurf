export type MaybePromise<T> = Promise<T> | T;

export type SyncContext = {
  force: boolean;
};

export type SyncKey<TParams> = ((params: Readonly<TParams>) => string) | string;

export type SyncState<TError = Error> = {
  error: TError | undefined;
  isValidating: boolean;
};

export type SyncSource<TParams, TResult = void, TError = Error> = {
  getCacheKey: (params: Readonly<TParams>) => string;
  getOwnerKey: (params: Readonly<TParams>) => string;
  getStoreKey: (params: Readonly<TParams>) => string;
  mapError: (error: unknown) => TError;
  sync: (params: Readonly<TParams>, context: SyncContext) => Promise<TResult>;
  ttlMs: number;
};

export type SyncAdapter<TError = Error> = {
  getState: (storeKey: string) => MaybePromise<SyncState<TError> | undefined>;
  getUpdatedAt: (ownerKey: string, cacheKey: string) => MaybePromise<null | number>;
  setState: (storeKey: string, state: SyncState<TError>) => MaybePromise<void>;
  setUpdatedAt: (ownerKey: string, cacheKey: string, updatedAt: number) => MaybePromise<void>;
};

export type RevalidateOptions = {
  force?: boolean;
  now?: () => number;
};

export type FreshRevalidateResult = {
  status: 'fresh';
  updatedAt: null | number;
};

export type SyncedRevalidateResult<TResult> = {
  deduped: boolean;
  status: 'synced';
  updatedAt: number;
  value: TResult;
};

export type RevalidateResult<TResult> = FreshRevalidateResult | SyncedRevalidateResult<TResult>;

type SyncDefinition<TParams, TResult, TError> = {
  key: SyncKey<TParams>;
  mapError?: (error: unknown) => TError;
  sync: (params: Readonly<TParams>, context: SyncContext) => MaybePromise<TResult>;
  ttlMs?: number;
};

const DEFAULT_TTL_MS = 1000 * 60 * 60;

const inFlight = new Map<string, Promise<SyncedRevalidateResult<unknown>>>();

const defaultMapError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

const resolveCacheKey = <TParams>(key: SyncKey<TParams>, params: Readonly<TParams>) =>
  typeof key === 'function' ? key(params) : key;

export const studentSyncSource =
  <TParams extends { studentId: string }>() =>
  <TResult = void, TError = Error>(
    definition: SyncDefinition<TParams, TResult, TError>,
  ): SyncSource<TParams, TResult, TError> => {
    const getCacheKey = (params: Readonly<TParams>) => resolveCacheKey(definition.key, params);
    const mapError = definition.mapError ?? (defaultMapError as (error: unknown) => TError);

    return {
      getCacheKey,
      getOwnerKey: (params) => params.studentId,
      getStoreKey: (params) => `student:${params.studentId}:${getCacheKey(params)}`,
      mapError,
      sync: async (params, context) => definition.sync(params, context),
      ttlMs: definition.ttlMs ?? DEFAULT_TTL_MS,
    };
  };

export const globalSyncSource =
  <TParams = void>() =>
  <TResult = void, TError = Error>(
    definition: SyncDefinition<TParams, TResult, TError>,
  ): SyncSource<TParams, TResult, TError> => {
    const getCacheKey = (params: Readonly<TParams>) => resolveCacheKey(definition.key, params);
    const mapError = definition.mapError ?? (defaultMapError as (error: unknown) => TError);

    return {
      getCacheKey,
      getOwnerKey: () => '__global__',
      getStoreKey: (params) => `global:${getCacheKey(params)}`,
      mapError,
      sync: async (params, context) => definition.sync(params, context),
      ttlMs: definition.ttlMs ?? DEFAULT_TTL_MS,
    };
  };

export const clearInFlightSyncs = () => {
  inFlight.clear();
};

export const revalidateSource = async <TParams, TResult, TError = Error>(
  source: SyncSource<TParams, TResult, TError>,
  params: Readonly<TParams>,
  adapter: SyncAdapter<TError>,
  options?: RevalidateOptions,
): Promise<RevalidateResult<TResult>> => {
  const force = options?.force ?? false;
  const now = options?.now ?? Date.now;
  const cacheKey = source.getCacheKey(params);
  const ownerKey = source.getOwnerKey(params);
  const storeKey = source.getStoreKey(params);
  const updatedAt = await adapter.getUpdatedAt(ownerKey, cacheKey);
  const isFresh = updatedAt != null && now() - updatedAt <= source.ttlMs;

  if (!force && isFresh) {
    return {
      status: 'fresh',
      updatedAt,
    };
  }

  const running = inFlight.get(storeKey);
  if (running) {
    const result = (await running) as SyncedRevalidateResult<TResult>;
    return {
      ...result,
      deduped: true,
    };
  }

  const promise = (async (): Promise<SyncedRevalidateResult<TResult>> => {
    try {
      await adapter.setState(storeKey, {
        error: undefined,
        isValidating: true,
      });

      const value = await source.sync(params, { force });
      const nextUpdatedAt = now();

      await adapter.setUpdatedAt(ownerKey, cacheKey, nextUpdatedAt);
      await adapter.setState(storeKey, {
        error: undefined,
        isValidating: false,
      });

      return {
        deduped: false,
        status: 'synced',
        updatedAt: nextUpdatedAt,
        value,
      };
    } catch (error) {
      const mappedError = source.mapError(error);

      await adapter.setState(storeKey, {
        error: mappedError,
        isValidating: false,
      });

      throw mappedError;
    } finally {
      inFlight.delete(storeKey);
    }
  })();

  inFlight.set(storeKey, promise as Promise<SyncedRevalidateResult<unknown>>);

  return promise;
};
