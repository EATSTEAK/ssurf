import { syncGraduationRequirementsInformation } from '@/entities/graduationRequirements/service';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useSyncGraduationRequirements = (options?: SyncOptions) => {
  const { graduationRequirementsClient, studentId } = useRusaintApplication();

  return useSyncData({
    client: graduationRequirementsClient,
    studentId,
    cacheKey: 'graduation.requirements',
    syncFn: syncGraduationRequirementsInformation,
    options,
  });
};
