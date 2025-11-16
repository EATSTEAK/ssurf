import { useState } from 'react';

import { db } from '@/db';
import { useSyncStore } from '@/stores/syncStore';

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
  const { isSyncing: getIsSyncing, setIsSyncing: setStoreSyncing } = useSyncStore();
  
  // 임시 cacheKey를 저장하기 위한 state (args가 전달되기 전까지는 알 수 없음)
  const [lastResolvedKey, setLastResolvedKey] = useState<null | string>(null);
  
  // 현재 cacheKey의 동기화 상태를 구독
  const isSyncing = lastResolvedKey ? getIsSyncing(lastResolvedKey) : false;

  const sync = async (args: TArgs, options?: SyncFunctionOptions) => {
    const force = options?.force ?? false;
    const resolvedCacheKey = typeof cacheKey === 'function' ? cacheKey(args) : cacheKey;
    
    // cacheKey 추적
    setLastResolvedKey(resolvedCacheKey);
    
    const cache = await db.query.cache.findFirst({
      where: (cache, { eq }) => eq(cache.key, resolvedCacheKey),
    });
    const shouldRequest = force || !cache || Date.now() - (cache.updatedAt ?? 0) > ttlMs;
    
    if (shouldRequest) {
      const currentSyncing = getIsSyncing(resolvedCacheKey);
      if (client && !currentSyncing) {
        setStoreSyncing(resolvedCacheKey, true);
        try {
          await syncFn(client, ...args);
        } catch (error) {
          console.error('Error during data sync:', error);
          throw error;
        } finally {
          setStoreSyncing(resolvedCacheKey, false);
        }
      }
    }
  };

  return { isSyncing, sync };
};
