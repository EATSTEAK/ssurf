import { useState } from 'react';

import { db } from '@/db';

export interface SyncFunctionOptions {
  force?: boolean;
}

export interface SyncOptions {
  ttlMs?: number;
}

export interface UseSyncDataParams<TClient, TArgs extends unknown[]> {
  /**
   * 캐시 키 (예: 'chapel.information.2024-1', 'grades.summary.certificated')
   */
  cacheKey: ((args: TArgs) => string) | string;

  /**
   * 클라이언트 객체 (예: chapelClient, gradesClient)
   */
  client: null | TClient;

  /**
   * 동기화 옵션
   */
  options?: SyncOptions;

  /**
   * 동기화 함수
   */
  syncFn: (client: TClient, ...args: TArgs) => Promise<void>;
}

export interface UseSyncDataReturn<TArgs extends unknown[]> {
  /**
   * 동기화 중인지 여부
   */
  isSyncing: boolean;

  /**
   * 동기화 함수
   */
  sync: (args: TArgs, options?: SyncFunctionOptions) => Promise<void>;
}

/**
 * 데이터 동기화를 위한 일반화된 훅
 *
 * @example
 * // Chapel 동기화
 * const { isSyncing, sync } = useSyncData({
 *   client: chapelClient,
 *   cacheKey: `chapel.information.${year}-${semester}`,
 *   syncFn: syncChapelInformation,
 *   args: [year, semester],
 *   options: { force, ttlMs },
 * });
 *
 * @example
 * // Grades 동기화
 * const { isSyncing, sync } = useSyncData({
 *   client: gradesClient,
 *   cacheKey: 'grades.summary.certificated',
 *   syncFn: syncGradeSummary,
 *   args: [courseType],
 *   options: { force, ttlMs },
 * });
 */
export const useSyncData = <TClient, TArgs extends unknown[]>({
  client,
  cacheKey,
  syncFn,
  options,
}: UseSyncDataParams<TClient, TArgs>): UseSyncDataReturn<TArgs> => {
  const ttlMs = options?.ttlMs ?? 1000 * 60 * 60;
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = async (args: TArgs, options?: SyncFunctionOptions) => {
    const force = options?.force ?? false;
    const resolvedCacheKey = typeof cacheKey === 'function' ? cacheKey(args) : cacheKey;
    const cache = await db.query.cache.findFirst({
      where: (cache, { eq }) => eq(cache.key, resolvedCacheKey),
    });
    const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;
    if (shouldRequest) {
      if (client && !isSyncing) {
        setIsSyncing(true);
        try {
          await syncFn(client, ...args);
        } finally {
          setIsSyncing(false);
        }
      }
    }
  };

  return { isSyncing, sync };
};
