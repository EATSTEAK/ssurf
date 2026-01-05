import { SemesterType } from '@rusaint/react-native';

import { syncChapelInformation } from '@/entities/chapel/service';
import { SyncOptions, useSyncData } from '@/shared/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useSyncChapel = (options?: SyncOptions) => {
  const { chapelClient, studentId } = useRusaintApplication();

  return useSyncData({
    client: chapelClient,
    studentId,
    cacheKey: ([year, semester]: [number, SemesterType]) =>
      `chapel.information.${year}-${semester}`,
    syncFn: syncChapelInformation,
    options,
  });
};
