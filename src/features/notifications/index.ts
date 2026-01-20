/**
 * 알림 서비스 모듈 진입점
 *
 * @example
 * ```ts
 * import {
 *   initializeNotificationService,
 *   requestNotificationPermission,
 *   executeNotificationCheck,
 * } from '@/features/notifications';
 *
 * // 앱 시작 시 초기화
 * await initializeNotificationService();
 *
 * // 권한 요청
 * const granted = await requestNotificationPermission();
 *
 * // 알림 체크 및 발송
 * await executeNotificationCheck(ctx, settings);
 * ```
 */

// 개별 알림 정의 export
export {
  chapelAttendanceNotification,
  classGradeNotification,
  getUnfinalizedSemesters,
  registerAllNotifications,
  semesterGradeNotification,
} from './definitions';

// 알림 정의 API export
export { defineNotification } from './lib/defineNotification';

// 레지스트리 API export
export {
  clearRegistry,
  getHandler,
  getHandlers,
  registerHandler,
} from './lib/notificationRegistry';

// 실행기 API export
export { runAllNotifications, runNotification } from './lib/notificationRunner';

// 타입 및 인터페이스 export
export type {
  ChapelAttendanceChange,
  ClassGradeChange,
  NotificationContent,
  NotificationContext,
  NotificationDefinitionOptions,
  NotificationHandler,
  NotificationSettings,
  SemesterGradeChange,
} from './model';

export { DEFAULT_NOTIFICATION_SETTINGS } from './model';

// 알림 서비스 API export
export {
  cancelAllScheduledNotifications,
  cancelScheduledNotification,
  checkNotificationPermission,
  dismissAllNotifications,
  executeNotificationCheck,
  initializeNotificationService,
  requestNotificationPermission,
  sendLocalNotification,
  sendLocalNotifications,
  setBadgeCount,
  setupNotificationChannel,
} from './service';
