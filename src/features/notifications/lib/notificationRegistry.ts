/**
 * 알림 레지스트리
 * 등록된 모든 알림 핸들러를 관리
 */

import type { NotificationHandler } from '../model';

/**
 * 등록된 알림 핸들러 목록
 */
const handlers: NotificationHandler[] = [];

/**
 * 알림 핸들러를 레지스트리에 등록
 * @param handler 등록할 알림 핸들러
 */
export const registerHandler = (handler: NotificationHandler): void => {
  // 중복 등록 방지
  const existingIndex = handlers.findIndex((h) => h.key === handler.key);
  if (existingIndex !== -1) {
    handlers[existingIndex] = handler;
  } else {
    handlers.push(handler);
  }
};

/**
 * 등록된 모든 알림 핸들러 반환
 * @returns 등록된 핸들러 배열
 */
export const getHandlers = (): NotificationHandler[] => {
  return [...handlers];
};

/**
 * 특정 키의 핸들러 조회
 * @param key 알림 핸들러 키
 * @returns 해당 핸들러 또는 undefined
 */
export const getHandler = (key: string): NotificationHandler | undefined => {
  return handlers.find((h) => h.key === key);
};

/**
 * 레지스트리 초기화 (테스트용)
 */
export const clearRegistry = (): void => {
  handlers.length = 0;
};
