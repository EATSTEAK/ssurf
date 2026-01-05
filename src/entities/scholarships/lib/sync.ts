import { syncScholarships } from '@/entities/scholarships/service';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useSyncScholarships = (options?: SyncOptions) => {
  const { scholarshipsClient, studentId } = useRusaintApplication();

  return useSyncData({
    client: scholarshipsClient,
    studentId,
    cacheKey: () => 'scholarships',
    syncFn: syncScholarships,
    options,
  });
};
