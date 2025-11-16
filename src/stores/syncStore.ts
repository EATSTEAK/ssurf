import { create } from 'zustand';

/**
 * 동기화 상태를 관리하는 스토어
 * cacheKey별로 isSyncing 상태를 공유합니다.
 */
interface SyncStore {
  /**
   * 특정 cacheKey의 동기화 상태를 제거합니다.
   */
  clearSyncing: (cacheKey: string) => void;

  /**
   * 특정 cacheKey의 동기화 상태를 가져옵니다.
   */
  isSyncing: (cacheKey: string) => boolean;

  /**
   * 특정 cacheKey의 동기화 상태를 설정합니다.
   */
  setIsSyncing: (cacheKey: string, isSyncing: boolean) => void;

  /**
   * cacheKey별 동기화 상태
   * key: cacheKey, value: isSyncing
   */
  syncingKeys: Map<string, boolean>;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  syncingKeys: new Map(),

  isSyncing: (cacheKey: string) => {
    return get().syncingKeys.get(cacheKey) ?? false;
  },

  setIsSyncing: (cacheKey: string, isSyncing: boolean) => {
    set((state) => {
      const newMap = new Map(state.syncingKeys);
      newMap.set(cacheKey, isSyncing);
      return { syncingKeys: newMap };
    });
  },

  clearSyncing: (cacheKey: string) => {
    set((state) => {
      const newMap = new Map(state.syncingKeys);
      newMap.delete(cacheKey);
      return { syncingKeys: newMap };
    });
  },
}));
