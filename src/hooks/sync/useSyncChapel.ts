import { SemesterType } from '@rusaint/react-native';

import { syncChapelInformation } from '@/db/sync/chapel';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

import { SyncOptions, useSyncData } from '../../shared/lib/sync/index';

export const useSyncChapel = (options?: SyncOptions) => {
  const { chapelClient } = useRusaintApplication();

  return useSyncData({
    client: chapelClient,
    cacheKey: ([year, semester]: [number, SemesterType]) =>
      `chapel.information.${year}-${semester}`,
    syncFn: syncChapelInformation,
    options,
  });
};
