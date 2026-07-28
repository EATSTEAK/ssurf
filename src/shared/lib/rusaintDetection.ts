import type {
  DetectionChange,
  DetectionRun,
  RusaintClientKind,
  RusaintClientMap,
  RusaintPipeline,
} from './rusaintDetectionCore';
import type { StoredCredentials } from '@/shared/lib/credentials';
import type { SemesterType } from '@rusaint/react-native';

import {
  ChapelApplicationBuilder,
  CourseGradesApplicationBuilder,
  CourseType,
  USaintSessionBuilder,
} from '@rusaint/react-native';

import { db } from '@/db';
import { getSettingSnapshot, setSetting } from '@/entities/settings/service';

import { defineRusaintPipeline, runRusaintPipelines } from './rusaintDetectionCore';
import {
  createRemoteChapelSnapshot,
  createRemoteCourseGradeSnapshot,
  createRemoteSemesterGradeSnapshot,
  createStoredChapelSnapshot,
  createStoredCourseGradeSnapshot,
  createStoredSemesterGradeSnapshot,
  fingerprintSnapshot,
} from './rusaintNotificationSnapshots';

export { defineRusaintPipeline } from './rusaintDetectionCore';
export type {
  DetectionChange,
  DetectionError,
  DetectionRun,
  RusaintPipeline,
  RusaintPipelineDefinition,
} from './rusaintDetectionCore';

const RUSAINT_NOTIFICATION_SETTINGS = {
  chapel: 'notifications.chapel.enabled',
  courseGrade: 'notifications.courseGrade.enabled',
  semesterGrade: 'notifications.semesterGrade.enabled',
} as const;

type RusaintNotificationSetting =
  (typeof RUSAINT_NOTIFICATION_SETTINGS)[keyof typeof RUSAINT_NOTIFICATION_SETTINGS];

export type RusaintUpdateTarget =
  | { category: 'chapel'; semester: SemesterType; year: number }
  | { category: 'courseGrade'; semester: SemesterType; year: number }
  | { category: 'semesterGrade' };

export type RusaintDetectionChange = DetectionChange<RusaintUpdateTarget>;
type RusaintDetectionRun = DetectionRun<RusaintUpdateTarget>;

const courseGradePipeline = defineRusaintPipeline({
  client: 'grades',
  fingerprint: fingerprintSnapshot,
  id: 'courseGrade',
  observe: async ({ client }) => {
    const selectedSemester = await client.getSelectedSemester();
    await client.lookup();
    const grades = await client.classes(
      CourseType.Bachelor,
      selectedSemester.year,
      selectedSemester.semester,
      true,
    );
    return createRemoteCourseGradeSnapshot(selectedSemester, grades);
  },
  readApplied: async ({ studentId, value }) => {
    const selectedSemester = {
      semester: value.semester as SemesterType,
      year: value.year,
    };
    const cacheKey = `grades.classes.${CourseType.Bachelor}.${value.year}.${value.semester}`;
    const [cacheEntry, grades] = await Promise.all([
      db.query.cache.findFirst({
        where: (cache, { and, eq }) => and(eq(cache.studentId, studentId), eq(cache.key, cacheKey)),
      }),
      db.query.classGrades.findMany({
        where: (classGrades, { and, eq }) =>
          and(
            eq(classGrades.studentId, studentId),
            eq(classGrades.year, value.year),
            eq(classGrades.semester, value.semester),
          ),
      }),
    ]);
    return cacheEntry ? createStoredCourseGradeSnapshot(selectedSemester, grades) : null;
  },
  settingKey: RUSAINT_NOTIFICATION_SETTINGS.courseGrade,
  target: (value): RusaintUpdateTarget => ({
    category: 'courseGrade',
    semester: value.semester as SemesterType,
    year: value.year,
  }),
});

const semesterGradePipeline = defineRusaintPipeline({
  client: 'grades',
  fingerprint: fingerprintSnapshot,
  id: 'semesterGrade',
  observe: async ({ client }) => {
    await client.reload();
    return createRemoteSemesterGradeSnapshot(await client.semesters(CourseType.Bachelor));
  },
  readApplied: async ({ studentId }) => {
    const cacheKey = `grades.semester.${CourseType.Bachelor}`;
    const [cacheEntry, grades] = await Promise.all([
      db.query.cache.findFirst({
        where: (cache, { and, eq }) => and(eq(cache.studentId, studentId), eq(cache.key, cacheKey)),
      }),
      db.query.semesterGrades.findMany({
        where: (semesterGrades, { eq }) => eq(semesterGrades.studentId, studentId),
      }),
    ]);
    return cacheEntry ? createStoredSemesterGradeSnapshot(grades) : null;
  },
  settingKey: RUSAINT_NOTIFICATION_SETTINGS.semesterGrade,
  target: (): RusaintUpdateTarget => ({ category: 'semesterGrade' }),
});

const chapelPipeline = defineRusaintPipeline({
  client: 'chapel',
  fingerprint: fingerprintSnapshot,
  id: 'chapel',
  observe: async ({ client }) => {
    const selectedSemester = await client.getSelectedSemester();
    await client.lookup();
    return createRemoteChapelSnapshot(
      await client.information(selectedSemester.year, selectedSemester.semester),
    );
  },
  readApplied: async ({ studentId, value }) => {
    const selectedSemester = {
      semester: value.semester as SemesterType,
      year: value.year,
    };
    const cacheKey = `chapel.information.${value.year}-${value.semester}`;
    const [cacheEntry, general, attendances] = await Promise.all([
      db.query.cache.findFirst({
        where: (cache, { and, eq }) => and(eq(cache.studentId, studentId), eq(cache.key, cacheKey)),
      }),
      db.query.chapelGeneral.findFirst({
        where: (chapelGeneral, { and, eq }) =>
          and(
            eq(chapelGeneral.studentId, studentId),
            eq(chapelGeneral.year, value.year),
            eq(chapelGeneral.semester, value.semester),
          ),
      }),
      db.query.chapelAttendances.findMany({
        where: (chapelAttendances, { and, eq }) =>
          and(
            eq(chapelAttendances.studentId, studentId),
            eq(chapelAttendances.year, value.year),
            eq(chapelAttendances.semester, value.semester),
          ),
      }),
    ]);
    return cacheEntry
      ? createStoredChapelSnapshot(selectedSemester, general ?? null, attendances)
      : null;
  },
  settingKey: RUSAINT_NOTIFICATION_SETTINGS.chapel,
  target: (value): RusaintUpdateTarget => ({
    category: 'chapel',
    semester: value.semester as SemesterType,
    year: value.year,
  }),
});

export const RUSAINT_PIPELINES: readonly RusaintPipeline<RusaintUpdateTarget>[] = [
  courseGradePipeline,
  semesterGradePipeline,
  chapelPipeline,
];

const createClientGetter = ({ id, password }: StoredCredentials) => {
  let session: null | ReturnType<USaintSessionBuilder['withPassword']> = null;
  let chapel: null | Promise<RusaintClientMap['chapel']> = null;
  let grades: null | Promise<RusaintClientMap['grades']> = null;

  const getSession = () => {
    session ??= new USaintSessionBuilder().withPassword(id, password);
    return session;
  };

  return async <K extends RusaintClientKind>(kind: K): Promise<RusaintClientMap[K]> => {
    if (kind === 'chapel') {
      chapel ??= getSession().then((value) => new ChapelApplicationBuilder().build(value));
      return chapel as Promise<RusaintClientMap[K]>;
    }

    grades ??= getSession().then((value) => new CourseGradesApplicationBuilder().build(value));
    return grades as Promise<RusaintClientMap[K]>;
  };
};

const isNotificationSetting = (key: string): key is RusaintNotificationSetting =>
  Object.values(RUSAINT_NOTIFICATION_SETTINGS).includes(key as RusaintNotificationSetting);

const inFlight = new Map<string, Promise<RusaintDetectionRun>>();

export const detectRusaintUpdates = (
  credentials: StoredCredentials,
): Promise<RusaintDetectionRun> => {
  const running = inFlight.get(credentials.id);
  if (running) {
    return running;
  }

  const job = runRusaintPipelines(RUSAINT_PIPELINES, {
    studentId: credentials.id,
    getClient: createClientGetter(credentials),
    isEnabled: async (settingKey) => {
      if (!isNotificationSetting(settingKey)) {
        throw new Error(`Unsupported Rusaint notification setting: ${settingKey}`);
      }
      return getSettingSnapshot(credentials.id, settingKey);
    },
    readState: () => getSettingSnapshot(credentials.id, 'notifications.rusaint.detectorState'),
    writeState: (state) => setSetting(credentials.id, 'notifications.rusaint.detectorState', state),
  }).finally(() => inFlight.delete(credentials.id));

  inFlight.set(credentials.id, job);
  return job;
};
