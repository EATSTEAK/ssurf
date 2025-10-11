import { USaintSessionBuilder, USaintSessionInterface } from '@rusaint/react-native';
import { createContext, useContext, useState } from 'react';

import { useExpoSecureStore } from '@/hooks/useExpoSecureStore';

type UserSessionItem = {
  id: null | string;
  password: null | string;
  session: null | USaintSessionInterface;
};

type RusaintSessionContextProps = {
  login: (id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  user: UserSessionItem;
};

const RusaintSessionContext = createContext<RusaintSessionContextProps>({
  user: {
    id: null,
    password: null,
    session: null,
  },
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
});

export const RusaintSessionProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [userInfo, setUserInfo] = useExpoSecureStore<Pick<UserSessionItem, 'id' | 'password'>>({
    defaultValue: {
      id: null,
      password: null,
    },
    key: 'user-info',
  });
  const [session, setSession] = useState<null | USaintSessionInterface>(null);

  const connectNewSession = async (id: string, password: string) => {
    const session = await new USaintSessionBuilder()
      .withPassword(id, password)
      .catch(console.error);
    if (session) {
      setSession(session);
    }
  };

  const login = async (id: string, password: string) => {
    // TODO: handle session refresh

    await connectNewSession(id, password);
    await setUserInfo({ id, password });
  };

  const refreshSession = async () => {
    if (!userInfo.id || !userInfo.password) {
      return;
    }
    await connectNewSession(userInfo.id, userInfo.password);
  };

  const logout = async () => {
    await setUserInfo({ id: null, password: null });
    setSession(null);
  };

  return (
    <RusaintSessionContext.Provider
      value={{ user: { ...userInfo, session }, login, logout, refreshSession }}
    >
      {children}
    </RusaintSessionContext.Provider>
  );
};

export const useRusaintSession = () => {
  const context = useContext(RusaintSessionContext);

  if (!context) {
    throw new Error('useRusaintSession은 RusaintSessionProvider 하위에서 사용되어야 해요.');
  }

  return context;
};
