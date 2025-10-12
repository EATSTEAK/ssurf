import { USaintSessionBuilder, USaintSessionInterface } from '@rusaint/react-native';
import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { useExpoSecureStore } from '@/hooks/useExpoSecureStore';

type RusaintSessionContextProps = {
  hasCredential: () => boolean;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  session: null | USaintSessionInterface;
};

const RusaintSessionContext = createContext<RusaintSessionContextProps>({
  session: null,
  hasCredential: () => false,
  login: async () => false,
  logout: async () => {},
  refreshSession: async () => {},
});

export const RusaintSessionProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { navigate } = useRouter();
  const [userInfo, setUserInfo] = useExpoSecureStore<{
    id: null | string;
    password: null | string;
  }>({
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

    if (!session) {
      return false;
    }

    setSession(session);
    return true;
  };

  const login = async (id: string, password: string) => {
    // TODO: handle session refresh
    if (await connectNewSession(id, password)) {
      await setUserInfo({ id, password });
      return true;
    }
    return false;
  };

  const refreshSession = useCallback(async () => {
    if (!userInfo.id || !userInfo.password) {
      return;
    }
    await connectNewSession(userInfo.id, userInfo.password);
  }, [userInfo.id, userInfo.password]);

  const logout = async () => {
    await setUserInfo({ id: null, password: null });
    setSession(null);
    navigate('/(onboarding)');
  };

  const hasCredential = () => {
    return userInfo.id != null && userInfo.password != null;
  };

  /* 
    세션 만료와는 상관 없이 앱이 시작될 때 저장된 아이디/비밀번호로 자동 로그인 시도
  */
  useAsyncEffect(async () => {
    if (userInfo.id && userInfo.password && !session) {
      refreshSession();
    }
  }, [refreshSession, session, userInfo.id, userInfo.password]);

  return (
    <RusaintSessionContext.Provider
      value={{ session, hasCredential, login, logout, refreshSession }}
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
