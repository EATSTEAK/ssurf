import { createStore } from 'zustand/vanilla';

export type SyncStatus = {
  error?: Error;
  isSyncing: boolean;
};

type SyncStore = {
  fail: (id: string, error: Error) => void;
  requests: Map<string, SyncStatus>;
  start: (id: string) => void;
  succeed: (id: string) => void;
};

export const syncStore = createStore<SyncStore>((set) => ({
  requests: new Map(),

  fail: (id, error) => {
    set((state) => ({
      requests: new Map(state.requests).set(id, { error, isSyncing: false }),
    }));
  },

  start: (id) => {
    set((state) => ({
      requests: new Map(state.requests).set(id, { isSyncing: true }),
    }));
  },

  succeed: (id) => {
    set((state) => ({
      requests: new Map(state.requests).set(id, { isSyncing: false }),
    }));
  },
}));
