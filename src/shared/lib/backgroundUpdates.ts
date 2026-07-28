import type { StoredCredentials } from '@/shared/lib/credentials';

import { CourseType } from '@rusaint/react-native';
import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { chapelSync } from '@/entities/chapel/lib/sync';
import { detectNoticeUpdates, NoticeDetectionChange } from '@/entities/feed/lib/noticeDetection';
import { feedEntrySync } from '@/entities/feed/lib/sync';
import { classGradesSync, semesterGradesSync } from '@/entities/grades/lib/sync';
import { getStoredCredentials } from '@/shared/lib/credentials';
import { detectRusaintUpdates, RusaintDetectionChange } from '@/shared/lib/rusaintDetection';
import { semesterToString } from '@/shared/lib/semester';
import { refresh } from '@/shared/lib/syncEngine';

export const UPDATE_BACKGROUND_TASK = 'ssurf-update-detection';
const UPDATE_CHANNEL_ID = 'updates';
const MINIMUM_INTERVAL_MINUTES = 60;
const FOREGROUND_DEBOUNCE_MS = 30_000;
const lastForegroundChecks = new Map<string, number>();
const updateTails = new Map<string, Promise<void>>();
let registrationTail = Promise.resolve();

export type UpdateDetectionMode = 'background' | 'foreground';

const notifyNoticeUpdates = async (changes: readonly NoticeDetectionChange[]) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      body:
        changes.length === 1
          ? '선택한 사이트에 새 공지가 등록됐어요.'
          : `${changes.length}개 사이트에 새 공지가 등록됐어요.`,
      data: { category: 'notice', slugs: changes.map((change) => change.slug) },
      title: '새 공지가 있어요',
    },
    trigger: Platform.OS === 'android' ? { channelId: UPDATE_CHANNEL_ID } : null,
  });
};

const notifyRusaintUpdate = async ({ target }: RusaintDetectionChange) => {
  const content = (() => {
    switch (target.category) {
      case 'chapel':
        return {
          body: `${semesterToString(target)} 채플 출석 정보를 확인해보세요.`,
          data: { category: target.category },
          title: '채플 출석 정보가 변경됐어요',
        };
      case 'courseGrade':
        return {
          body: `${semesterToString(target)} 과목별 성적을 확인해보세요.`,
          data: { category: target.category },
          title: '과목별 성적이 변경됐어요',
        };
      case 'semesterGrade':
        return {
          body: '최신 학기별 성적을 확인해보세요.',
          data: { category: target.category },
          title: '학기별 성적이 업데이트됐어요',
        };
    }
  })();

  await Notifications.scheduleNotificationAsync({
    content,
    trigger: Platform.OS === 'android' ? { channelId: UPDATE_CHANNEL_ID } : null,
  });
};

const syncNoticeUpdates = async (changes: readonly NoticeDetectionChange[]) => {
  const results = await Promise.all(
    changes.map(async (change) => ({
      change,
      result: await refresh(feedEntrySync(change.slug)),
    })),
  );
  return results.filter(({ result }) => result !== 'failed').map(({ change }) => change);
};

const syncRusaintUpdate = (studentId: string, { target }: RusaintDetectionChange) => {
  switch (target.category) {
    case 'chapel':
      return refresh(chapelSync(studentId, target.year, target.semester));
    case 'courseGrade':
      return refresh(classGradesSync(studentId, CourseType.Bachelor, target.year, target.semester));
    case 'semesterGrade':
      return refresh(semesterGradesSync(studentId, CourseType.Bachelor));
  }
};

const executeUpdateDetection = async (
  credentials: StoredCredentials,
  mode: UpdateDetectionMode,
) => {
  const [noticeRun, rusaintRun] = await Promise.all([
    detectNoticeUpdates(credentials.id),
    detectRusaintUpdates(credentials),
  ]);
  const currentCredentials = await getStoredCredentials();
  if (currentCredentials?.id !== credentials.id) {
    return { failed: false };
  }

  if (mode === 'background') {
    const noticeChanges = noticeRun.changes.filter((change) => change.shouldNotify);
    if (noticeChanges.length > 0) {
      await notifyNoticeUpdates(noticeChanges);
      await noticeRun.acknowledge(noticeChanges);
    }

    for (const change of rusaintRun.changes.filter((change) => change.shouldNotify)) {
      await notifyRusaintUpdate(change);
      await rusaintRun.acknowledge([change]);
    }
  } else {
    if (noticeRun.changes.length > 0) {
      const synced = await syncNoticeUpdates(noticeRun.changes);
      await noticeRun.acknowledge(synced);
    }

    const synced: RusaintDetectionChange[] = [];
    for (const change of rusaintRun.changes) {
      if ((await syncRusaintUpdate(credentials.id, change)) !== 'failed') {
        synced.push(change);
      }
    }
    await rusaintRun.acknowledge(synced);
  }

  for (const failure of noticeRun.errors) {
    console.error(`Failed to detect notice updates for ${failure.slug}:`, failure.error);
  }
  for (const failure of rusaintRun.errors) {
    console.error(`Failed to detect ${failure.pipelineId} updates:`, failure.error);
  }

  return {
    failed:
      noticeRun.checked + rusaintRun.checked === 0 &&
      noticeRun.errors.length + rusaintRun.errors.length > 0,
  };
};

export const runUpdateDetection = async (mode: UpdateDetectionMode) => {
  const credentials = await getStoredCredentials();
  if (!credentials) {
    return { failed: false };
  }

  if (mode === 'foreground') {
    const now = Date.now();
    if (now - (lastForegroundChecks.get(credentials.id) ?? 0) < FOREGROUND_DEBOUNCE_MS) {
      return { failed: false };
    }
    lastForegroundChecks.set(credentials.id, now);
  }

  const previous = updateTails.get(credentials.id) ?? Promise.resolve();
  const job = previous.catch(() => undefined).then(() => executeUpdateDetection(credentials, mode));
  const tail = job.then(
    () => undefined,
    () => undefined,
  );
  updateTails.set(credentials.id, tail);
  void tail.finally(() => {
    if (updateTails.get(credentials.id) === tail) {
      updateTails.delete(credentials.id);
    }
  });
  return job;
};

const unregisterBackgroundUpdates = async () => {
  if (await TaskManager.isTaskRegisteredAsync(UPDATE_BACKGROUND_TASK)) {
    await BackgroundTask.unregisterTaskAsync(UPDATE_BACKGROUND_TASK);
  }
};

const enqueueRegistration = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = registrationTail.then(operation, operation);
  registrationTail = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

export const enableBackgroundUpdates = (studentId: string) =>
  enqueueRegistration(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(UPDATE_CHANNEL_ID, {
        importance: Notifications.AndroidImportance.DEFAULT,
        name: '업데이트',
      });
    }

    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Notifications.requestPermissionsAsync();
    }

    const credentials = await getStoredCredentials();
    if (!permission.granted || credentials?.id !== studentId) {
      await unregisterBackgroundUpdates();
      return false;
    }

    if (!(await TaskManager.isTaskRegisteredAsync(UPDATE_BACKGROUND_TASK))) {
      await BackgroundTask.registerTaskAsync(UPDATE_BACKGROUND_TASK, {
        minimumInterval: MINIMUM_INTERVAL_MINUTES,
      });
    }
    return true;
  });

export const disableBackgroundUpdates = () => enqueueRegistration(unregisterBackgroundUpdates);

if (!TaskManager.isTaskDefined(UPDATE_BACKGROUND_TASK)) {
  TaskManager.defineTask(UPDATE_BACKGROUND_TASK, async () => {
    try {
      const result = await runUpdateDetection('background');
      return result.failed
        ? BackgroundTask.BackgroundTaskResult.Failed
        : BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
      console.error('Background update detection failed:', error);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}
