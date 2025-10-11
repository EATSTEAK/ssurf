import { ChapelInformation, SemesterType } from '@rusaint/react-native';
import { useEffect, useState } from 'react';

import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';

export const useChapelInformation = (year: number, semester: SemesterType) => {
  const { chapelClient: client } = useRusaintApplication();
  const [information, setInformation] = useState<ChapelInformation | null>(null);
  useEffect(() => {
    if (client) {
      (async () => {
        const info = await client.information(year, semester);
        setInformation(info);
      })();
    }
  }, [client, year, semester]);
  return information;
};
