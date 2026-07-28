import assert from 'node:assert/strict';

import {
  detectNewNoticeIds,
  parseObservedNoticeIds,
} from '../src/entities/feed/lib/noticeDetectionCore.ts';
import {
  defineRusaintPipeline,
  runRusaintPipelines,
} from '../src/shared/lib/rusaintDetectionCore.ts';
import {
  createRemoteChapelSnapshot,
  createRemoteCourseGradeSnapshot,
  createRemoteSemesterGradeSnapshot,
  createStoredChapelSnapshot,
  createStoredCourseGradeSnapshot,
  createStoredSemesterGradeSnapshot,
  fingerprintSnapshot,
} from '../src/shared/lib/rusaintNotificationSnapshots.ts';

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
assert.equal(baseline.checked, 1);
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
const skipped = await runRusaintPipelines([disabled], dependencies);
assert.deepEqual(skipped.changes, []);
assert.equal(skipped.checked, 0);
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

applied = 'local';
remote = 'remote';
const defaultState = {};
let writtenState = {};
const usesSharedDefault = await runRusaintPipelines([pipeline], {
  ...dependencies,
  readState: async () => defaultState,
  writeState: async (value) => {
    writtenState = { ...value };
  },
});
await usesSharedDefault.acknowledge(usesSharedDefault.changes);
assert.deepEqual(defaultState, {});
assert.deepEqual(writtenState, { grade: 'remote' });

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

const selectedSemester = { semester: 1, year: 2026 };
const remoteCourseGrades = createRemoteCourseGradeSnapshot(selectedSemester, [
  {
    className: '분산시스템',
    code: '215001',
    detail: new Map([
      ['기말', 95],
      ['중간', 90],
    ]),
    gradePoints: 3,
    professor: '김교수',
    rank: 'A+',
    score: { inner: [96], tag: 'Score' },
    semester: 1,
    year: 2026,
  },
]);
const storedCourseGrades = createStoredCourseGradeSnapshot(selectedSemester, [
  {
    className: '분산시스템',
    code: '215001',
    detailJson: '{"중간":90,"기말":95}',
    gradePoints: 3,
    professor: '김교수',
    rank: 'A+',
    scoreType: 'Score',
    scoreValue: 96,
    semester: 1,
    studentId: 'student-a',
    year: 2026,
  },
]);
assert.equal(fingerprintSnapshot(remoteCourseGrades), fingerprintSnapshot(storedCourseGrades));

const semesterGrade = {
  academicProbation: false,
  arithmeticMean: 93.2,
  attemptedCredits: 18,
  consult: false,
  earnedCredits: 18,
  flunked: false,
  generalRank: { first: 4, second: 80 },
  gradePointsAverage: 4.2,
  gradePointsSum: 75.6,
  pfEarnedCredits: 0,
  semester: 1,
  semesterRank: { first: 2, second: 40 },
  year: 2026,
};
assert.equal(
  fingerprintSnapshot(createRemoteSemesterGradeSnapshot([semesterGrade])),
  fingerprintSnapshot(
    createStoredSemesterGradeSnapshot([
      {
        academicProbation: 0,
        arithmeticMean: semesterGrade.arithmeticMean,
        attemptedCredits: semesterGrade.attemptedCredits,
        consult: 0,
        earnedCredits: semesterGrade.earnedCredits,
        flunked: 0,
        generalRankFirst: semesterGrade.generalRank.first,
        generalRankSecond: semesterGrade.generalRank.second,
        gradePointsAverage: semesterGrade.gradePointsAverage,
        gradePointsSum: semesterGrade.gradePointsSum,
        pfEarnedCredits: semesterGrade.pfEarnedCredits,
        semester: semesterGrade.semester,
        semesterRankFirst: semesterGrade.semesterRank.first,
        semesterRankSecond: semesterGrade.semesterRank.second,
        studentId: 'student-a',
        year: semesterGrade.year,
      },
    ]),
  ),
);

const chapelInformation = {
  absenceRequests: [],
  attendances: [
    {
      attendance: '출석',
      category: '채플',
      classDate: '2026-03-10',
      division: 1,
      instructor: '이교수',
      instructorDepartment: '교목실',
      note: '',
      result: 'P',
      title: '개강채플',
    },
  ],
  generalInformation: {
    absenceTime: 0,
    chapelRoom: '한경직기념관',
    chapelTime: '10:30',
    division: 1,
    floorLevel: 1,
    note: '',
    result: 'P',
    seatNumber: 'A-1',
  },
  semester: 1,
  year: 2026,
};
assert.equal(
  fingerprintSnapshot(createRemoteChapelSnapshot(chapelInformation)),
  fingerprintSnapshot(
    createStoredChapelSnapshot(
      selectedSemester,
      {
        absenceTime: 0,
        division: 1,
        floor: 1,
        note: '',
        result: 'P',
        room: '한경직기념관',
        seat: 'A-1',
        semester: 1,
        studentId: 'student-a',
        time: '10:30',
        year: 2026,
      },
      [
        {
          attendance: '출석',
          category: '채플',
          date: '2026-03-10',
          division: 1,
          instructor: '이교수',
          instructorDepartment: '교목실',
          note: '',
          result: 'P',
          semester: 1,
          studentId: 'student-a',
          title: '개강채플',
          year: 2026,
        },
      ],
    ),
  ),
);

console.log('update detector checks passed');
