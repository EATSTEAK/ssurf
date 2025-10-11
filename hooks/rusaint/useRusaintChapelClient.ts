import { ChapelApplicationBuilder, ChapelApplicationInterface } from '@rusaint/react-native';
import { useEffect, useState } from 'react';

import { useRusaintSession } from '@/hooks/rusaint/useRusaintSession';

export const useChapelClient = (): ChapelApplicationInterface | null => {
  const session = useRusaintSession();
  const [client, setClient] = useState<ChapelApplicationInterface | null>(null);
  // TODO: Use global state for client management
  useEffect(() => {
    if (session) {
      (async () => {
        const c = await new ChapelApplicationBuilder().build(session);
        setClient(c);
      })();
    }
  }, [session]);
  return client;
};
