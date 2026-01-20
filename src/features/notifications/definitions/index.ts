/**
 * 알림 정의 모음
 */

import { registerHandler } from '../lib/notificationRegistry';
import { chapelAttendanceNotification } from './chapelAttendance';
import { classGradeNotification } from './classGrade';
import { semesterGradeNotification } from './semesterGrade';

/**
 * 모든 알림 정의를 레지스트리에 등록
 * initializeNotificationService에서 명시적으로 호출됨
 */
export const registerAllNotifications = (): void => {
  registerHandler(classGradeNotification);
  registerHandler(semesterGradeNotification);
  registerHandler(chapelAttendanceNotification);
};

// 개별 알림 정의를 named export로 제공
export { chapelAttendanceNotification } from './chapelAttendance';
export { classGradeNotification, getUnfinalizedSemesters } from './classGrade';
export { semesterGradeNotification } from './semesterGrade';
