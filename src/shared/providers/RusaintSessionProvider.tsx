import { USaintSessionBuilder, USaintSessionInterface } from '@rusaint/react-native';
import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { clearAllData } from '@/db';
import { useExpoSecureStore } from '@/shared/lib/useExpoSecureStore';

type RusaintSessionContextProps = {
  hasCredential: boolean | null;
  isLoading: boolean;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  session: null | USaintSessionInterface;
};

const RusaintSessionContext = createContext<RusaintSessionContextProps>({
  session: null,
  hasCredential: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  refreshSession: async () => {},
});

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

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
  const [isLoading, setIsLoading] = useState(true);
  const sessionCreatedAtRef = useRef<Date | null>(null);

  const connectNewSession = async (id: string, password: string) => {
    const session = await new USaintSessionBuilder()
      .withPassword(id, password)
      .catch(console.error);

    if (!session) {
      return false;
    }

    sessionCreatedAtRef.current = new Date();
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
    try {
      await clearAllData();
      await setUserInfo({ id: null, password: null });
      setSession(null);
      sessionCreatedAtRef.current = null;

      navigate('/');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      await setUserInfo({ id: null, password: null });
      setSession(null);
      sessionCreatedAtRef.current = null;
      throw error;
    }
  };

  const hasCredential = userInfo.id != null && userInfo.password != null;

  /*
    세션 만료와는 상관 없이 앱이 시작될 때 저장된 아이디/비밀번호로 자동 로그인 시도
  */
  useAsyncEffect(async () => {
    const sessionConstructed = !!session;
    const sessionExpired =
      sessionCreatedAtRef.current &&
      new Date().getTime() - sessionCreatedAtRef.current.getTime() > SESSION_TTL_MS;
    if (userInfo.id && userInfo.password && (!sessionConstructed || sessionExpired)) {
      await refreshSession();
    }
    setIsLoading(false);
  }, [refreshSession, session, userInfo.id, userInfo.password]);

  return (
    <RusaintSessionContext.Provider
      value={{ session, hasCredential, isLoading, login, logout, refreshSession }}
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
