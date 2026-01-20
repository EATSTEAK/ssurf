/**
 * 알림 실행기
 * 등록된 모든 알림을 순회하며 실행
 */

import type { NotificationContent, NotificationContext, NotificationSettings } from '../model';

import { getHandlers } from './notificationRegistry';

/**
 * 설정 경로에 해당하는 알림이 활성화되어 있는지 확인
 * @param settings 알림 설정
 * @param settingPath 설정 경로 (예: 'grades.classGrade')
 * @returns 활성화 여부
 */
const isSettingEnabled = (settings: NotificationSettings, settingPath: string): boolean => {
  // 전체 알림이 비활성화된 경우
  if (!settings.enabled) {
    return false;
  }

  // 설정 경로 파싱 (예: 'grades.classGrade' → ['grades', 'classGrade'])
  const pathParts = settingPath.split('.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = settings;
  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return current === true;
};

/**
 * 등록된 모든 알림 핸들러를 실행하여 알림 콘텐츠 수집
 * @param ctx 알림 컨텍스트
 * @param settings 알림 설정
 * @returns 발송해야 할 알림 콘텐츠 배열
 */
export const runAllNotifications = async (
  ctx: NotificationContext,
  settings: NotificationSettings,
): Promise<NotificationContent[]> => {
  const handlers = getHandlers();
  const allNotifications: NotificationContent[] = [];

  for (const handler of handlers) {
    // 해당 알림이 비활성화된 경우 건너뛰기
    if (!isSettingEnabled(settings, handler.settingPath)) {
      console.log(`[Notification] ${handler.key} 알림이 비활성화되어 있습니다.`);
      continue;
    }

    try {
      // 핸들러 실행
      const notifications = await handler.execute(ctx);

      // 생성된 알림 콘텐츠 추가
      if (notifications.length > 0) {
        console.log(`[Notification] ${handler.key}: ${notifications.length}개 알림 생성됨`);
        allNotifications.push(...notifications);
      }
    } catch (error) {
      // 개별 핸들러 에러가 전체 실행을 중단시키지 않음
      console.error(`[Notification] ${handler.key} 실행 중 에러:`, error);
    }
  }

  return allNotifications;
};

/**
 * 특정 핸들러만 실행
 * @param key 핸들러 키
 * @param ctx 알림 컨텍스트
 * @param settings 알림 설정
 * @returns 발송해야 할 알림 콘텐츠 배열
 */
export const runNotification = async (
  key: string,
  ctx: NotificationContext,
  settings: NotificationSettings,
): Promise<NotificationContent[]> => {
  const handlers = getHandlers();
  const handler = handlers.find((h) => h.key === key);

  if (!handler) {
    console.warn(`[Notification] ${key} 핸들러를 찾을 수 없습니다.`);
    return [];
  }

  if (!isSettingEnabled(settings, handler.settingPath)) {
    console.log(`[Notification] ${handler.key} 알림이 비활성화되어 있습니다.`);
    return [];
  }

  try {
    return await handler.execute(ctx);
  } catch (error) {
    console.error(`[Notification] ${handler.key} 실행 중 에러:`, error);
    return [];
  }
};
