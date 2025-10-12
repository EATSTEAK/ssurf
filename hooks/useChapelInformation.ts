import { ChapelInformation, SemesterType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';

export const useChapelInformation = (year: number, semester: SemesterType) => {
  const { chapelClient: client } = useRusaintApplication();
  const [information, setInformation] = useState<ChapelInformation | null>(null);
  useAsyncEffect(async () => {
    if (client) {
      const info = await client.information(year, semester);
      setInformation(info);
    }
  }, [client, year, semester]);
  return information;
};
