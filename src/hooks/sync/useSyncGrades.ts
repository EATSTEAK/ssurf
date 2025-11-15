import { CourseType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';
import { db } from '@/db';
import { syncGradeSummary, syncSemesterGrades } from '@/db/sync/grades';

export interface SyncGradesOptions {
  force?: boolean;
  ttlMs?: number;
}

/**
 * 성적 요약 정보를 동기화하는 훅
 * certificated와 recorded 두 가지 타입의 성적 요약을 가져옴
 */
export const useSyncGradeSummary = (
  courseType: CourseType,
  { force = false, ttlMs = 1000 * 60 * 60 }: SyncGradesOptions = {},
) => {
  const { gradesClient } = useRusaintApplication();
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = async () => {
    if (gradesClient && !isSyncing) {
      setIsSyncing(true);
      await syncGradeSummary(gradesClient, courseType);
      setIsSyncing(false);
    }
  };

  useAsyncEffect(async () => {
    const cache = await db.query.cache.findFirst({
      where: (cache, { eq }) => eq(cache.key, 'grades.summary.certificated'),
    });
    const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;
    if (shouldRequest) {
      await sync();
    }
  }, [gradesClient, force, isSyncing, courseType, ttlMs]);

  return { isSyncing, sync };
};

/**
 * 특정 학기의 성적 정보를 동기화하는 훅
 * 학기별 성적과 과목별 성적을 가져옴
 */
export const useSyncSemesterGrades = (
  courseType: CourseType,
  year: number,
  semester: number,
  { force = false, ttlMs = 1000 * 60 * 60 }: SyncGradesOptions = {},
) => {
  const { gradesClient } = useRusaintApplication();
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = async () => {
    if (gradesClient && !isSyncing) {
      setIsSyncing(true);
      await syncSemesterGrades(gradesClient, courseType, year, semester);
      setIsSyncing(false);
    }
  };

  useAsyncEffect(async () => {
    const cacheKey = `grades.semester.${year}-${semester}`;
    const cache = await db.query.cache.findFirst({
      where: (cache, { eq }) => eq(cache.key, cacheKey),
    });
    const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;
    if (shouldRequest) {
      await sync();
    }
  }, [gradesClient, force, isSyncing, courseType, year, semester, ttlMs]);

  return { isSyncing, sync };
};
