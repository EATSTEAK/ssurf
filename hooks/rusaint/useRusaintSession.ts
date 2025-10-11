import { USaintSessionBuilder, USaintSessionInterface } from '@rusaint/react-native';
import { useEffect, useState } from 'react';

export const useRusaintSession = (): null | USaintSessionInterface => {
  // TODO: Use global state for session management
  const [session, setSession] = useState<null | USaintSessionInterface>(null);
  useEffect(() => {
    (async () => {
      const s = await new USaintSessionBuilder().withPassword('20211561', '6kZf6O&dA^ZSS6');
      setSession(s);
    })();
  }, []);
  return session;
};
