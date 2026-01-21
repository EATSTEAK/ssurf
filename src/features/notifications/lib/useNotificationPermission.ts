/**
 * 알림 권한 관리 훅
 * expo-notifications를 사용하여 알림 권한 요청 및 상태 관리
 */
import * as Notifications from 'expo-notifications';
import { useCallback, useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

export interface UseNotificationPermissionReturn {
  /** 권한 확인 함수 */
  checkPermission: () => Promise<void>;
  /** 알림 권한 여부 (null: 확인 중) */
  hasPermission: boolean | null;
  /** 권한 요청 함수 */
  requestPermission: () => Promise<boolean>;
}

/**
 * 알림 권한을 관리하는 훅
 * 권한 상태 확인 및 요청 기능 제공
 */
export function useNotificationPermission(): UseNotificationPermissionReturn {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const checkPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  const requestPermission = useCallback(async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      setHasPermission(true);
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  // 컴포넌트 마운트 시 권한 상태 확인
  useAsyncEffect(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  return {
    checkPermission,
    hasPermission,
    requestPermission,
  };
}
