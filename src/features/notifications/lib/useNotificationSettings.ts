/**
 * 알림 설정 관리 훅
 * expo-secure-store를 사용하여 알림 설정을 영속화
 */
import { useCallback, useMemo } from 'react';

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from '@/features/notifications/model';
import { useExpoSecureStore } from '@/shared/lib/useExpoSecureStore';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export interface UseNotificationSettingsReturn {
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 알림 설정 */
  settings: NotificationSettings;
  /** 전체 알림 토글 */
  toggleEnabled: (enabled: boolean) => void;
  /** 채플 알림 설정 업데이트 */
  updateChapelSettings: (key: 'attendance', value: boolean) => void;
  /** 성적 알림 설정 업데이트 */
  updateGradeSettings: (key: 'classGrade' | 'semesterGrade', value: boolean) => void;
}

/**
 * 알림 설정을 관리하는 훅
 * SecureStore를 사용하여 설정을 영속화합니다.
 */
export function useNotificationSettings(): UseNotificationSettingsReturn {
  const [settings, setSettings] = useExpoSecureStore({
    defaultValue: DEFAULT_NOTIFICATION_SETTINGS as unknown as Record<string, unknown>,
    key: NOTIFICATION_SETTINGS_KEY,
  });

  // 타입 안전성을 위해 캐스팅
  const typedSettings = settings as unknown as NotificationSettings;

  const toggleEnabled = useCallback(
    (enabled: boolean) => {
      setSettings((prev) => {
        const prevSettings = prev as unknown as NotificationSettings;
        return {
          ...prevSettings,
          enabled,
        } as unknown as Record<string, unknown>;
      });
    },
    [setSettings],
  );

  const updateGradeSettings = useCallback(
    (key: 'classGrade' | 'semesterGrade', value: boolean) => {
      setSettings((prev) => {
        const prevSettings = prev as unknown as NotificationSettings;
        return {
          ...prevSettings,
          grades: {
            ...prevSettings.grades,
            [key]: value,
          },
        } as unknown as Record<string, unknown>;
      });
    },
    [setSettings],
  );

  const updateChapelSettings = useCallback(
    (key: 'attendance', value: boolean) => {
      setSettings((prev) => {
        const prevSettings = prev as unknown as NotificationSettings;
        return {
          ...prevSettings,
          chapel: {
            ...prevSettings.chapel,
            [key]: value,
          },
        } as unknown as Record<string, unknown>;
      });
    },
    [setSettings],
  );

  // SecureStore는 비동기로 로드되지만 useSyncExternalStore가 동기적으로 처리함
  // 초기값이 DEFAULT_NOTIFICATION_SETTINGS이므로 실질적으로 isLoading은 항상 false
  const isLoading = false;

  return useMemo(
    () => ({
      isLoading,
      settings: typedSettings,
      toggleEnabled,
      updateChapelSettings,
      updateGradeSettings,
    }),
    [isLoading, typedSettings, toggleEnabled, updateChapelSettings, updateGradeSettings],
  );
}
