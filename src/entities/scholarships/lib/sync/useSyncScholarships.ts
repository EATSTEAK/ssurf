import { syncScholarships } from '@/entities/scholarships/api/scholarships';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useSyncScholarships = (options?: SyncOptions) => {
  const { scholarshipsClient } = useRusaintApplication();

  return useSyncData({
    client: scholarshipsClient,
    cacheKey: () => 'scholarships',
    syncFn: syncScholarships,
    options,
  });
};
