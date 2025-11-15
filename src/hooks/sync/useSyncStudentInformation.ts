import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';
import { syncStudentInformation } from '@/db/sync/studentInformation';

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
