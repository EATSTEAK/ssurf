/// <reference types="node" />

import { beforeEach, expect, test } from 'vitest';

import {
  clearInFlightSyncs,
  globalSyncSource,
  revalidateSource,
  studentSyncSource,
  type SyncAdapter,
  type SyncContext,
  type SyncState,
} from './index.js';

type TestParams = {
  resource: string;
  studentId: string;
};

type StateWrite<TError> = {
  state: SyncState<TError>;
  storeKey: string;
};

type UpdatedAtWrite = {
  cacheKey: string;
  ownerKey: string;
  updatedAt: number;
};

type TestAdapter<TError> = SyncAdapter<TError> & {
  stateWrites: StateWrite<TError>[];
  updatedAtWrites: UpdatedAtWrite[];
};

const params = {
  resource: 'grades',
  studentId: 'student-1',
} satisfies TestParams;

const ttlMs = 1_000;

const cacheMapKey = (ownerKey: string, cacheKey: string) => `${ownerKey}:${cacheKey}`;

const createAdapter = <TError>(initialUpdatedAt: null | number): TestAdapter<TError> => {
  const updatedAtByKey = new Map<string, null | number>([
    [cacheMapKey(params.studentId, params.resource), initialUpdatedAt],
  ]);
  const stateWrites: StateWrite<TError>[] = [];
  const updatedAtWrites: UpdatedAtWrite[] = [];

  return {
    getState: (storeKey) => {
      for (let index = stateWrites.length - 1; index >= 0; index -= 1) {
        const write = stateWrites[index];

        if (write.storeKey === storeKey) {
          return write.state;
        }
      }

      return undefined;
    },
    getUpdatedAt: (ownerKey, cacheKey) =>
      updatedAtByKey.get(cacheMapKey(ownerKey, cacheKey)) ?? null,
    setState: (storeKey, state) => {
      stateWrites.push({ state, storeKey });
    },
    setUpdatedAt: (ownerKey, cacheKey, updatedAt) => {
      updatedAtByKey.set(cacheMapKey(ownerKey, cacheKey), updatedAt);
      updatedAtWrites.push({ cacheKey, ownerKey, updatedAt });
    },
    stateWrites,
    updatedAtWrites,
  };
};

const createSource = <TResult, TError = Error>(definition: {
  mapError?: (error: unknown) => TError;
  sync: (params: Readonly<TestParams>, context: SyncContext) => Promise<TResult> | TResult;
}) =>
  studentSyncSource<TestParams>()<TResult, TError>({
    key: (sourceParams) => sourceParams.resource,
    sync: definition.sync,
    ttlMs,
    ...(definition.mapError === undefined ? {} : { mapError: definition.mapError }),
  });

const createDeferred = <T>() => {
  let resolve: (value: T) => void;
  let reject: (reason: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {
    promise,
    reject: (reason: unknown) => reject(reason),
    resolve: (value: T) => resolve(value),
  };
};

const waitForNextTurn = () =>
  new Promise<void>((resolve) => {
    setImmediate(resolve);
  });

beforeEach(() => {
  clearInFlightSyncs();
});

test('fresh cache skips sync', async () => {
  const adapter = createAdapter<Error>(1_500);
  let syncCalls = 0;
  const source = createSource({
    sync: () => {
      syncCalls += 1;
    },
  });

  const result = await revalidateSource(source, params, adapter, {
    now: () => 2_000,
  });

  expect(result).toEqual({
    status: 'fresh',
    updatedAt: 1_500,
  });
  expect(syncCalls).toBe(0);
  expect(adapter.stateWrites).toEqual([]);
  expect(adapter.updatedAtWrites).toEqual([]);
});

test('expired cache runs sync and updates state/cache', async () => {
  const adapter = createAdapter<Error>(1_000);
  const syncCalls: SyncContext[] = [];
  const source = createSource({
    sync: (_params, context) => {
      syncCalls.push(context);

      return { synced: true };
    },
  });

  const result = await revalidateSource(source, params, adapter, {
    now: () => 3_000,
  });

  expect(result).toEqual({
    deduped: false,
    status: 'synced',
    updatedAt: 3_000,
    value: { synced: true },
  });
  expect(syncCalls).toEqual([{ force: false }]);
  expect(adapter.stateWrites).toEqual([
    {
      state: {
        error: undefined,
        isValidating: true,
      },
      storeKey: 'student:student-1:grades',
    },
    {
      state: {
        error: undefined,
        isValidating: false,
      },
      storeKey: 'student:student-1:grades',
    },
  ]);
  expect(adapter.updatedAtWrites).toEqual([
    {
      cacheKey: 'grades',
      ownerKey: 'student-1',
      updatedAt: 3_000,
    },
  ]);
});

test('force refresh ignores TTL', async () => {
  const adapter = createAdapter<Error>(1_500);
  const syncCalls: SyncContext[] = [];
  const source = createSource({
    sync: (_params, context) => {
      syncCalls.push(context);

      return 'forced';
    },
  });

  const result = await revalidateSource(source, params, adapter, {
    force: true,
    now: () => 2_000,
  });

  expect(result).toEqual({
    deduped: false,
    status: 'synced',
    updatedAt: 2_000,
    value: 'forced',
  });
  expect(syncCalls).toEqual([{ force: true }]);
});

test('duplicate storeKey calls share the in-flight promise', async () => {
  const adapter = createAdapter<Error>(null);
  const deferred = createDeferred<string>();
  let syncCalls = 0;
  const source = createSource({
    sync: () => {
      syncCalls += 1;

      return deferred.promise;
    },
  });

  const first = revalidateSource(source, params, adapter, {
    now: () => 4_000,
  });
  const second = revalidateSource(source, params, adapter, {
    now: () => 4_000,
  });

  await waitForNextTurn();

  expect(syncCalls).toBe(1);

  deferred.resolve('shared-result');

  const [firstResult, secondResult] = await Promise.all([first, second]);

  expect(firstResult).toEqual({
    deduped: false,
    status: 'synced',
    updatedAt: 4_000,
    value: 'shared-result',
  });
  expect(secondResult).toEqual({
    deduped: true,
    status: 'synced',
    updatedAt: 4_000,
    value: 'shared-result',
  });
  expect(syncCalls).toBe(1);
});

test('success writes updatedAt', async () => {
  const adapter = createAdapter<Error>(null);
  const source = createSource({
    sync: () => 'ok',
  });

  await revalidateSource(source, params, adapter, {
    now: () => 7_777,
  });

  expect(adapter.updatedAtWrites).toEqual([
    {
      cacheKey: 'grades',
      ownerKey: 'student-1',
      updatedAt: 7_777,
    },
  ]);
});

test('failure stores mapped error', async () => {
  type MappedError = {
    code: 'SYNC_FAILED';
    message: string;
  };

  const adapter = createAdapter<MappedError>(null);
  const rawError = new Error('upstream unavailable');
  const mappedError = {
    code: 'SYNC_FAILED',
    message: 'upstream unavailable',
  } satisfies MappedError;
  const source = createSource<never, MappedError>({
    mapError: (error) => ({
      code: 'SYNC_FAILED',
      message: error instanceof Error ? error.message : String(error),
    }),
    sync: () => {
      throw rawError;
    },
  });

  await expect(
    revalidateSource(source, params, adapter, {
      now: () => 8_000,
    }),
  ).rejects.toEqual(mappedError);

  expect(adapter.stateWrites).toEqual([
    {
      state: {
        error: undefined,
        isValidating: true,
      },
      storeKey: 'student:student-1:grades',
    },
    {
      state: {
        error: mappedError,
        isValidating: false,
      },
      storeKey: 'student:student-1:grades',
    },
  ]);
});

test('adapter failure before sync does not leave stale inFlight', async () => {
  const adapterError = new Error('adapter unavailable');
  let syncCalls = 0;
  const source = createSource({
    sync: () => {
      syncCalls += 1;

      return 'recovered';
    },
  });
  const failingAdapter: SyncAdapter<Error> = {
    getState: () => undefined,
    getUpdatedAt: () => null,
    setState: () => {
      throw adapterError;
    },
    setUpdatedAt: () => undefined,
  };

  await expect(
    revalidateSource(source, params, failingAdapter, {
      now: () => 9_000,
    }),
  ).rejects.toBe(adapterError);

  expect(syncCalls).toBe(0);

  const recoveringAdapter = createAdapter<Error>(null);
  const result = await revalidateSource(source, params, recoveringAdapter, {
    now: () => 9_001,
  });

  expect(result).toEqual({
    deduped: false,
    status: 'synced',
    updatedAt: 9_001,
    value: 'recovered',
  });
  expect(syncCalls).toBe(1);
});

test('TResult is type-preserved', async () => {
  type ResultPayload = {
    count: number;
    label: string;
  };

  const adapter = createAdapter<Error>(null);
  const source = globalSyncSource<{ scope: string }>()<ResultPayload>({
    key: (sourceParams) => sourceParams.scope,
    sync: () => ({
      count: 3,
      label: 'typed',
    }),
    ttlMs,
  });

  const result = await revalidateSource(
    source,
    {
      scope: 'summary',
    },
    adapter,
    {
      now: () => 10_000,
    },
  );

  expect(result.status).toBe('synced');

  if (result.status !== 'synced') {
    throw new Error('expected synced result');
  }

  const value: ResultPayload = result.value;

  expect(value).toEqual({
    count: 3,
    label: 'typed',
  });
});
