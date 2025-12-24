import { syncStudentInformation } from '@/entities/studentInformation/api/studentInformation';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useSyncStudentInformation = (options?: SyncOptions) => {
  const { studentInformationClient } = useRusaintApplication();

  return useSyncData({
    client: studentInformationClient,
    cacheKey: () => `student-information.general`,
    syncFn: syncStudentInformation,
    options,
  });
};
