import type {
  DetectionRun,
  RusaintClientKind,
  RusaintClientMap,
  RusaintPipeline,
} from './rusaintDetectionCore';
import type { StoredCredentials } from '@/shared/lib/credentials';

import {
  ChapelApplicationBuilder,
  CourseGradesApplicationBuilder,
  USaintSessionBuilder,
} from '@rusaint/react-native';

import { getSettingSnapshot, setSetting } from '@/entities/settings/service';

import { runRusaintPipelines } from './rusaintDetectionCore';

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

export const RUSAINT_PIPELINES: readonly RusaintPipeline[] = [];

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

const inFlight = new Map<string, Promise<DetectionRun>>();

export const detectRusaintUpdates = (credentials: StoredCredentials): Promise<DetectionRun> => {
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
