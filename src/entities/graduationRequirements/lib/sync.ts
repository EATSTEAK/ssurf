import { syncGraduationRequirementsInformation } from '@/entities/graduationRequirements/service';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useSyncGraduationRequirements = (options?: SyncOptions) => {
  const { graduationRequirementsClient } = useRusaintApplication();

  return useSyncData({
    client: graduationRequirementsClient,
    cacheKey: 'graduation.requirements',
    syncFn: syncGraduationRequirementsInformation,
    options,
  });
};
