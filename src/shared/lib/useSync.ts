import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';

import { syncStore } from '../stores/syncStore';
import { ensure, getSyncRequestId, refresh, SyncRequest, SyncResult } from './syncEngine';

type UseSyncRequestsOptions = {
  sequential?: boolean;
};

const runRequests = async (
  requests: readonly SyncRequest[],
  run: (request: SyncRequest) => Promise<SyncResult>,
  sequential: boolean,
) => {
  if (!sequential) {
    return Promise.all(requests.map(run));
  }

  const results: SyncResult[] = [];
  for (const request of requests) {
    results.push(await run(request));
  }
  return results;
};

export function useSyncRequests(
  requests: readonly SyncRequest[],
  options?: UseSyncRequestsOptions,
) {
  const requestsRef = useRef(requests);
  useEffect(() => {
    requestsRef.current = requests;
  });

  const ids = requests.map(getSyncRequestId);
  const dependencyKey = ids.join('\0');
  const sequential = options?.sequential ?? false;
  const states = useStore(syncStore, (state) => state.requests);

  useEffect(() => {
    void runRequests(requestsRef.current, ensure, sequential);
  }, [dependencyKey, sequential]);

  return {
    error: ids.map((id) => states.get(id)?.error).find(Boolean),
    isSyncing: ids.some((id) => states.get(id)?.isSyncing ?? false),
    refresh: () => runRequests(requestsRef.current, refresh, sequential),
  };
}

export function useSync(request: SyncRequest) {
  const state = useSyncRequests([request]);

  return {
    error: state.error,
    isSyncing: state.isSyncing,
    refresh: async () => (await state.refresh())[0],
  };
}
