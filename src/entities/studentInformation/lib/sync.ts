import { syncStudentInformation } from '@/entities/studentInformation/service';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useSyncStudentInformation = (options?: SyncOptions) => {
  const { studentInformationClient, studentId } = useRusaintApplication();

  return useSyncData({
    client: studentInformationClient,
    studentId,
    cacheKey: () => `student-information.general`,
    syncFn: syncStudentInformation,
    options,
  });
};
