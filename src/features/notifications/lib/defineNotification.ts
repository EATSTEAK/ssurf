/**
 * 알림 정의 팩토리 함수
 * 알림 정의를 생성하여 핸들러 반환
 */

import type {
  NotificationContent,
  NotificationContext,
  NotificationDefinitionOptions,
  NotificationHandler,
} from '../model';

/**
 * 알림 정의를 생성하는 팩토리 함수
 * 생성된 핸들러는 registerAllNotifications에서 명시적으로 등록됨
 *
 * @template TChange 변경 사항 타입
 * @param options 알림 정의 옵션
 * @returns 알림 핸들러
 *
 * @example
 * ```ts
 * defineNotification<ClassGradeChange>({
 *   key: 'classGrade',
 *   settingPath: 'grades.classGrade',
 *   check: async (ctx) => {
 *     // 데이터 페칭 및 비교 로직
 *     return changes;
 *   },
 *   notify: (change) => ({
 *     title: '성적 변경',
 *     body: `${change.className} 성적이 ${change.newRank}로 변경되었습니다.`,
 *   }),
 * });
 * ```
 */
export const defineNotification = <TChange>(
  options: NotificationDefinitionOptions<TChange>,
): NotificationHandler => {
  const { key, settingPath, check, notify } = options;

  /**
   * 핸들러 실행 함수
   * check 함수를 실행하여 변경 사항을 확인하고,
   * 각 변경 사항에 대해 notify 함수로 알림 콘텐츠 생성
   */
  const execute = async (ctx: NotificationContext): Promise<NotificationContent[]> => {
    try {
      // 변경 사항 확인
      const changes = await check(ctx);

      // 변경 사항이 없으면 빈 배열 반환
      if (changes.length === 0) {
        return [];
      }

      // 각 변경 사항에 대해 알림 콘텐츠 생성
      return changes.map((change) => notify(change));
    } catch (error) {
      // 개별 알림 실패가 다른 알림에 영향 주지 않도록 에러 로깅 후 빈 배열 반환
      console.error(`[Notification] ${key} check 실행 중 에러 발생:`, error);
      return [];
    }
  };

  const handler: NotificationHandler = {
    execute,
    key,
    settingPath,
  };

  return handler;
};
