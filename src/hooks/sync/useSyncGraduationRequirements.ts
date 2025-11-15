import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';
import { syncGraduationRequirementsInformation } from '@/db/sync/graduationRequirements';

import { SyncOptions, useSyncData } from './index';

export const useSyncGraduationRequirements = (options?: SyncOptions) => {
  const { graduationRequirementsClient } = useRusaintApplication();

  return useSyncData({
    client: graduationRequirementsClient,
    cacheKey: 'graduation.requirements',
    syncFn: syncGraduationRequirementsInformation,
    options,
  });
};
