import { create } from 'zustand';

/**
 * 동기화 상태를 관리하는 스토어
 * cacheKey별로 isSyncing 상태를 공유합니다.
 */
interface SyncStore {
  /**
   * 특정 cacheKey의 에러 상태를 제거합니다.
   */
  clearError: (cacheKey: string) => void;

  /**
   * 특정 cacheKey의 동기화 상태를 제거합니다.
   */
  clearSyncing: (cacheKey: string) => void;

  /**
   * cacheKey별 에러 상태
   * key: cacheKey, value: Error
   */
  errors: Map<string, Error>;

  /**
   * 특정 cacheKey의 에러를 가져옵니다.
   */
  getError: (cacheKey: string) => Error | undefined;

  /**
   * 특정 cacheKey의 동기화 상태를 가져옵니다.
   */
  isSyncing: (cacheKey: string) => boolean;

  /**
   * 특정 cacheKey의 에러를 설정합니다.
   */
  setError: (cacheKey: string, error: Error | undefined) => void;

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
  errors: new Map(),
  syncingKeys: new Map(),

  clearError: (cacheKey: string) => {
    set((state) => {
      const newMap = new Map(state.errors);
      newMap.delete(cacheKey);
      return { errors: newMap };
    });
  },

  clearSyncing: (cacheKey: string) => {
    set((state) => {
      const newMap = new Map(state.syncingKeys);
      newMap.delete(cacheKey);
      return { syncingKeys: newMap };
    });
  },

  getError: (cacheKey: string) => {
    return get().errors.get(cacheKey);
  },

  isSyncing: (cacheKey: string) => {
    return get().syncingKeys.get(cacheKey) ?? false;
  },

  setError: (cacheKey: string, error: Error | undefined) => {
    set((state) => {
      const newMap = new Map(state.errors);
      if (error === undefined) {
        newMap.delete(cacheKey);
      } else {
        newMap.set(cacheKey, error);
      }
      return { errors: newMap };
    });
  },

  setIsSyncing: (cacheKey: string, isSyncing: boolean) => {
    set((state) => {
      const newMap = new Map(state.syncingKeys);
      newMap.set(cacheKey, isSyncing);
      return { syncingKeys: newMap };
    });
  },
}));
