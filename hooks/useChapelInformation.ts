import { ChapelInformation, SemesterType } from '@rusaint/react-native';
import { useEffect, useState } from 'react';

import { useChapelClient } from '@/hooks/rusaint/useRusaintChapelClient';

export const useChapelInformation = (year: number, semester: SemesterType) => {
  const client = useChapelClient();
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
