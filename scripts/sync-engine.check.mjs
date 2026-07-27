import assert from 'node:assert/strict';

import { createSyncEngine, getSyncRequestId } from '../src/shared/lib/syncEngineCore.ts';

const updatedAt = new Map();
const states = new Map();
let now = 10_000;

const engine = createSyncEngine({
  fail: (id, error) => states.set(id, { error, isSyncing: false }),
  getUpdatedAt: async (scope, resource) => updatedAt.get(JSON.stringify([scope, resource])),
  now: () => now,
  start: (id) => states.set(id, { isSyncing: true }),
  succeed: (id) => states.set(id, { isSyncing: false }),
});

let releaseReadiness;
const ready = new Promise((resolve) => {
  releaseReadiness = resolve;
});
let readinessRuns = 0;
const readinessRequest = {
  key: ['student-a', 'readiness'],
  run: async () => {
    await ready;
    readinessRuns += 1;
  },
};
const firstReadiness = engine.ensure(readinessRequest);
const secondReadiness = engine.ensure(readinessRequest);
assert.strictEqual(firstReadiness, secondReadiness);
releaseReadiness();
assert.equal(await firstReadiness, 'synced');
assert.equal(readinessRuns, 1);

let ttlRuns = 0;
const ttlRequest = {
  key: ['student-a', 'ttl'],
  run: async () => {
    ttlRuns += 1;
  },
  ttlMs: 1_000,
};
updatedAt.set(getSyncRequestId(ttlRequest), now - 500);
assert.equal(await engine.ensure(ttlRequest), 'fresh');
assert.equal(ttlRuns, 0);
now += 1_001;
assert.equal(await engine.ensure(ttlRequest), 'synced');
assert.equal(ttlRuns, 1);
updatedAt.set(getSyncRequestId(ttlRequest), now);
assert.equal(await engine.refresh(ttlRequest), 'synced');
assert.equal(ttlRuns, 2);

let shouldFail = true;
const retryRequest = {
  key: ['student-a', 'retry'],
  run: async () => {
    if (shouldFail) {
      throw new Error('temporary');
    }
  },
};
assert.equal(await engine.refresh(retryRequest), 'failed');
assert.equal(states.get(getSyncRequestId(retryRequest)).error.message, 'temporary');
shouldFail = false;
assert.equal(await engine.refresh(retryRequest), 'synced');
assert.deepEqual(states.get(getSyncRequestId(retryRequest)), { isSyncing: false });

let scopedRuns = 0;
const scopedRequest = (scope) => ({
  key: [scope, 'same-resource'],
  run: async () => {
    scopedRuns += 1;
  },
});
await Promise.all([
  engine.refresh(scopedRequest('student-a')),
  engine.refresh(scopedRequest('student-b')),
]);
assert.equal(scopedRuns, 2);

console.log('sync engine checks passed');
