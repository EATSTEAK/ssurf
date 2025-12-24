import { syncStudentInformation } from '@/db/sync/studentInformation';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

import { SyncOptions, useSyncData } from './index';

export const useSyncStudentInformation = (options?: SyncOptions) => {
  const { studentInformationClient } = useRusaintApplication();

  return useSyncData({
    client: studentInformationClient,
    cacheKey: () => `student-information.general`,
    syncFn: syncStudentInformation,
    options,
  });
};
