import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';
import { syncScholarships } from '@/db/sync/scholarships';

import { SyncOptions, useSyncData } from './index';

export const useSyncScholarships = (options?: SyncOptions) => {
  const { scholarshipsClient } = useRusaintApplication();

  return useSyncData({
    client: scholarshipsClient,
    cacheKey: () => 'scholarships',
    syncFn: syncScholarships,
    options,
  });
};
