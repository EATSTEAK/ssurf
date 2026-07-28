import { inArray } from 'drizzle-orm';

import { db } from '@/db';
import { feedNotices } from '@/entities/feed/model';
import { fetchFeedEntry } from '@/entities/feed/service';
import { NotificationDetectorState } from '@/entities/settings/model';
import { getSettingSnapshot, setSetting } from '@/entities/settings/service';

import { detectNewNoticeIds, parseObservedNoticeIds } from './noticeDetectionCore';

export type NoticeDetectionChange = {
  currentIds: readonly string[];
  newIds: readonly string[];
  shouldNotify: boolean;
  slug: string;
};

export type NoticeDetectionError = {
  error: Error;
  slug: string;
};

export type NoticeDetectionRun = {
  acknowledge: (changes: readonly NoticeDetectionChange[]) => Promise<void>;
  changes: readonly NoticeDetectionChange[];
  checked: number;
  errors: readonly NoticeDetectionError[];
};

const toError = (error: unknown) => (error instanceof Error ? error : new Error(String(error)));
const encodeIds = (ids: readonly string[]) => JSON.stringify(ids);

const runNoticeDetection = async (studentId: string): Promise<NoticeDetectionRun> => {
  const enabled = await getSettingSnapshot(studentId, 'notifications.notice.enabled');
  const selectedSlugs = Array.from(
    new Set((await getSettingSnapshot(studentId, 'feed.selectedNoticeSlugs')).filter(Boolean)),
  );

  if (!enabled || selectedSlugs.length === 0) {
    return { acknowledge: async () => {}, changes: [], checked: 0, errors: [] };
  }

  const [rows, state] = await Promise.all([
    db
      .select({ id: feedNotices.id, slug: feedNotices.slug })
      .from(feedNotices)
      .where(inArray(feedNotices.slug, selectedSlugs)),
    getSettingSnapshot(studentId, 'notifications.notice.detectorState'),
  ]);
  const localIds = new Map<string, string[]>();
  for (const row of rows) {
    const ids = localIds.get(row.slug) ?? [];
    ids.push(row.id);
    localIds.set(row.slug, ids);
  }
  const nextState: NotificationDetectorState = Object.fromEntries(
    selectedSlugs.flatMap((slug) => (state[slug] === undefined ? [] : [[slug, state[slug]]])),
  );
  const changes: NoticeDetectionChange[] = [];
  const errors: NoticeDetectionError[] = [];

  const results = await Promise.allSettled(selectedSlugs.map((slug) => fetchFeedEntry(slug)));
  results.forEach((result, index) => {
    const slug = selectedSlugs[index];
    if (result.status === 'rejected') {
      errors.push({ error: toError(result.reason), slug });
      return;
    }

    const detection = detectNewNoticeIds({
      localIds: localIds.get(slug) ?? [],
      observedIds: parseObservedNoticeIds(state[slug]),
      remoteIds: result.value.items.map((item) => item.id),
    });

    if (detection.newIds.length > 0) {
      changes.push({ ...detection, slug });
    } else {
      nextState[slug] = encodeIds(detection.currentIds);
    }
  });

  if (JSON.stringify(nextState) !== JSON.stringify(state)) {
    await setSetting(studentId, 'notifications.notice.detectorState', nextState);
  }

  const detected = new Map(changes.map((change) => [change.slug, encodeIds(change.currentIds)]));

  return {
    changes,
    checked: selectedSlugs.length - errors.length,
    errors,
    acknowledge: async (accepted) => {
      const updates = accepted.filter(
        (change) => detected.get(change.slug) === encodeIds(change.currentIds),
      );
      if (updates.length === 0) {
        return;
      }

      const latest = {
        ...(await getSettingSnapshot(studentId, 'notifications.notice.detectorState')),
      };
      for (const change of updates) {
        latest[change.slug] = encodeIds(change.currentIds);
      }
      await setSetting(studentId, 'notifications.notice.detectorState', latest);
    },
  };
};

const inFlight = new Map<string, Promise<NoticeDetectionRun>>();

export const detectNoticeUpdates = (studentId: string): Promise<NoticeDetectionRun> => {
  const running = inFlight.get(studentId);
  if (running) {
    return running;
  }

  const job = runNoticeDetection(studentId).finally(() => inFlight.delete(studentId));
  inFlight.set(studentId, job);
  return job;
};
