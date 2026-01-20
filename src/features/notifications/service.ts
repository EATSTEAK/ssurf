/**
 * 알림 서비스
 * expo-notifications를 사용한 로컬 알림 발송 및 권한 관리
 */

import type { NotificationContent, NotificationContext, NotificationSettings } from './model';

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerAllNotifications } from './definitions';
import { runAllNotifications } from './lib/notificationRunner';

/**
 * Android 알림 채널 ID
 */
const ANDROID_CHANNEL_ID = 'ssurf-notifications';

/**
 * 알림 핸들러 설정
 * 앱이 포그라운드에 있을 때의 알림 동작 설정
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Android 알림 채널 설정
 * Android 8.0+ 에서 필요한 알림 채널 생성
 */
export const setupNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      description: 'SSURF 앱의 성적 및 채플 알림',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#4A90D9',
      name: 'SSURF 알림',
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
};

/**
 * 알림 권한 요청
 * @returns 권한 허용 여부
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

/**
 * 현재 알림 권한 상태 확인
 * @returns 권한 허용 여부
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

/**
 * 로컬 알림 발송
 * @param content 알림 콘텐츠
 * @returns 알림 식별자
 */
export const sendLocalNotification = async (content: NotificationContent): Promise<string> => {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      body: content.body,
      data: content.data,
      sound: 'default',
      subtitle: content.subtitle,
      title: content.title,
    },
    trigger: null, // 즉시 발송
  });

  return notificationId;
};

/**
 * 여러 알림 일괄 발송
 * @param contents 알림 콘텐츠 배열
 * @returns 발송된 알림 식별자 배열
 */
export const sendLocalNotifications = async (
  contents: NotificationContent[],
): Promise<string[]> => {
  const notificationIds: string[] = [];

  for (const content of contents) {
    try {
      const id = await sendLocalNotification(content);
      notificationIds.push(id);
    } catch (error) {
      console.error('[Notification] 알림 발송 실패:', error);
    }
  }

  return notificationIds;
};

/**
 * 예약된 알림 취소
 * @param notificationId 알림 식별자
 */
export const cancelScheduledNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

/**
 * 모든 예약된 알림 취소
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * 모든 표시된 알림 제거
 */
export const dismissAllNotifications = async (): Promise<void> => {
  await Notifications.dismissAllNotificationsAsync();
};

/**
 * 알림 배지 수 설정
 * @param count 배지 수
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};

/**
 * 알림 체크 및 발송 실행
 * 등록된 모든 알림 핸들러를 실행하고 변경 사항이 있으면 알림 발송
 *
 * @param ctx 알림 컨텍스트
 * @param settings 알림 설정
 * @returns 발송된 알림 수
 */
export const executeNotificationCheck = async (
  ctx: NotificationContext,
  settings: NotificationSettings,
): Promise<number> => {
  // 알림이 비활성화된 경우 실행하지 않음
  if (!settings.enabled) {
    console.log('[Notification] 알림이 비활성화되어 있습니다.');
    return 0;
  }

  // 알림 권한 확인
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.log('[Notification] 알림 권한이 없습니다.');
    return 0;
  }

  try {
    // 모든 알림 핸들러 실행하여 알림 콘텐츠 수집
    const notifications = await runAllNotifications(ctx, settings);

    if (notifications.length === 0) {
      console.log('[Notification] 발송할 알림이 없습니다.');
      return 0;
    }

    // 알림 발송
    const sentIds = await sendLocalNotifications(notifications);
    console.log(`[Notification] ${sentIds.length}개 알림 발송 완료`);

    return sentIds.length;
  } catch (error) {
    console.error('[Notification] 알림 체크 실행 중 에러:', error);
    return 0;
  }
};

/**
 * 알림 서비스 초기화
 * 앱 시작 시 호출하여 알림 채널 설정 및 권한 확인
 */
export const initializeNotificationService = async (): Promise<boolean> => {
  try {
    // 알림 정의 등록
    registerAllNotifications();

    // Android 알림 채널 설정
    await setupNotificationChannel();

    // 권한 확인 (자동으로 요청하지 않음)
    const hasPermission = await checkNotificationPermission();

    console.log(`[Notification] 서비스 초기화 완료. 권한: ${hasPermission ? '허용' : '거부'}`);
    return hasPermission;
  } catch (error) {
    console.error('[Notification] 서비스 초기화 실패:', error);
    return false;
  }
};
