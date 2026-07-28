import assert from 'node:assert/strict';

import {
  detectNewNoticeIds,
  parseObservedNoticeIds,
} from '../src/entities/feed/lib/noticeDetectionCore.ts';
import {
  defineRusaintPipeline,
  runRusaintPipelines,
} from '../src/shared/lib/rusaintDetectionCore.ts';

let applied = null;
let remote = 'v1';
let state = {};
let clientReads = 0;

const pipeline = defineRusaintPipeline({
  client: 'grades',
  fingerprint: (value) => value,
  id: 'grade',
  observe: async () => remote,
  readApplied: async () => applied,
  settingKey: 'grade.enabled',
  target: (value) => ({ value }),
});

const dependencies = {
  studentId: 'student-a',
  getClient: async () => {
    clientReads += 1;
    return {};
  },
  isEnabled: async (key) => key !== 'disabled',
  readState: async () => ({ ...state }),
  writeState: async (value) => {
    state = { ...value };
  },
};

const baseline = await runRusaintPipelines([pipeline], dependencies);
assert.deepEqual(baseline.changes, []);
assert.deepEqual(state, { grade: 'v1' });
assert.equal(clientReads, 1);

applied = 'v1';
remote = 'v2';
const changed = await runRusaintPipelines([pipeline], dependencies);
assert.deepEqual(changed.changes, [
  {
    fingerprint: 'v2',
    pipelineId: 'grade',
    shouldNotify: true,
    target: { value: 'v2' },
  },
]);
assert.deepEqual(state, { grade: 'v1' });

const retried = await runRusaintPipelines([pipeline], dependencies);
assert.equal(retried.changes.length, 1);
await changed.acknowledge(changed.changes);
assert.deepEqual(state, { grade: 'v2' });
const pendingSync = await runRusaintPipelines([pipeline], dependencies);
assert.equal(pendingSync.changes.length, 1);
assert.equal(pendingSync.changes[0].shouldNotify, false);
applied = 'v2';
assert.deepEqual((await runRusaintPipelines([pipeline], dependencies)).changes, []);

const disabled = defineRusaintPipeline({
  client: 'chapel',
  fingerprint: String,
  id: 'disabled',
  observe: async () => {
    throw new Error('must not run');
  },
  readApplied: async () => null,
  settingKey: 'disabled',
  target: String,
});
const readsBeforeDisabled = clientReads;
assert.deepEqual((await runRusaintPipelines([disabled], dependencies)).changes, []);
assert.equal(clientReads, readsBeforeDisabled);

const failing = defineRusaintPipeline({
  client: 'chapel',
  fingerprint: String,
  id: 'failing',
  observe: async () => {
    throw new Error('temporary');
  },
  readApplied: async () => null,
  settingKey: 'grade.enabled',
  target: String,
});
const partial = await runRusaintPipelines([pipeline, failing], dependencies);
assert.equal(partial.errors.length, 1);
assert.equal(partial.errors[0].pipelineId, 'failing');
assert.equal(partial.errors[0].error.message, 'temporary');

await assert.rejects(
  runRusaintPipelines([pipeline, pipeline], dependencies),
  /duplicate Rusaint pipeline id/,
);

assert.deepEqual(
  detectNewNoticeIds({ localIds: [], observedIds: null, remoteIds: ['b', 'a', 'a'] }),
  { currentIds: ['a', 'b'], newIds: [], shouldNotify: false },
);
assert.deepEqual(
  detectNewNoticeIds({
    localIds: ['a'],
    observedIds: parseObservedNoticeIds('["a","b"]'),
    remoteIds: ['a', 'b', 'c'],
  }),
  { currentIds: ['a', 'b', 'c'], newIds: ['b', 'c'], shouldNotify: true },
);
assert.deepEqual(
  detectNewNoticeIds({
    localIds: ['a'],
    observedIds: ['a', 'b', 'c'],
    remoteIds: ['a', 'b', 'c'],
  }),
  { currentIds: ['a', 'b', 'c'], newIds: ['b', 'c'], shouldNotify: false },
);
assert.deepEqual(
  detectNewNoticeIds({ localIds: ['a'], observedIds: ['a', 'b'], remoteIds: ['a'] }),
  { currentIds: ['a'], newIds: [], shouldNotify: false },
);
assert.equal(parseObservedNoticeIds('invalid'), null);

console.log('update detector checks passed');
