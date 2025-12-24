import { syncGraduationRequirementsInformation } from '@/db/sync/graduationRequirements';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

import { SyncOptions, useSyncData } from '../../shared/lib/sync/index';

export const useSyncGraduationRequirements = (options?: SyncOptions) => {
  const { graduationRequirementsClient } = useRusaintApplication();

  return useSyncData({
    client: graduationRequirementsClient,
    cacheKey: 'graduation.requirements',
    syncFn: syncGraduationRequirementsInformation,
    options,
  });
};
