import { SemesterType } from '@rusaint/react-native';

import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';
import { syncChapelInformation } from '@/db/sync/chapel';

import { SyncOptions, useSyncData } from './index';

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
