/**
 * 채플 출석 정보 변경 알림 정의
 * 채플 출석/결석 정보가 변경되었을 때 알림 발송
 */

import type { ChapelAttendanceChange } from '../model';

import { ChapelApplicationBuilder, SemesterType } from '@rusaint/react-native';

import { db } from '@/db';
import { syncChapelInformation } from '@/entities/chapel/service';

import { defineNotification } from '../lib/defineNotification';

/**
 * 채플 출석 정보 변경 알림
 *
 * - 출석/결석 횟수 변경 감지
 * - 새로운 출석 기록 추가 감지
 * - 기존 entities/chapel의 sync 로직 활용
 */
export const chapelAttendanceNotification = defineNotification<ChapelAttendanceChange>({
  key: 'chapelAttendance',
  settingPath: 'chapel.attendance',

  check: async (ctx) => {
    const { session, studentId, currentSemester } = ctx;
    const changes: ChapelAttendanceChange[] = [];

    // 채플 클라이언트 생성
    const chapelClient = await new ChapelApplicationBuilder().build(session);

    const { year, semester } = currentSemester;
    // SemesterType으로 변환 (1, 2, 3, 4 → SemesterType)
    const semesterType = semester as SemesterType;

    // 기존 채플 출석 정보 조회
    const existingAttendances = await db.query.chapelAttendances.findMany({
      where: (table, { and, eq }) =>
        and(eq(table.studentId, studentId), eq(table.year, year), eq(table.semester, semester)),
    });

    // 기존 출석 정보를 Map으로 변환 (날짜 → 출석상태)
    const existingAttendancesMap = new Map(existingAttendances.map((a) => [a.date, a.attendance]));

    // 최신 채플 정보 동기화
    await syncChapelInformation(chapelClient, studentId, year, semesterType);

    // 동기화된 최신 채플 출석 정보 조회
    const newAttendances = await db.query.chapelAttendances.findMany({
      where: (table, { and, eq }) =>
        and(eq(table.studentId, studentId), eq(table.year, year), eq(table.semester, semester)),
    });

    // 출석 정보 변경 감지
    for (const newAttendance of newAttendances) {
      const existingAttendance = existingAttendancesMap.get(newAttendance.date);

      // 새로 추가된 출석 기록 또는 출석 상태 변경된 경우
      if (existingAttendance === undefined || existingAttendance !== newAttendance.attendance) {
        // 출석 상태에 따른 변경 유형 결정
        const changeType = determineChangeType(newAttendance.attendance);

        changes.push({
          attendance: newAttendance.attendance,
          changeType,
          date: newAttendance.date,
          semester: newAttendance.semester,
          year: newAttendance.year,
        });
      }
    }

    return changes;
  },

  notify: (change) => {
    const dateText = formatDate(change.date);
    const isAttendance = change.changeType === 'attendance';

    return {
      body: isAttendance
        ? `${dateText} 채플 출석이 확인되었습니다.`
        : `${dateText} 채플 결석이 기록되었습니다.`,
      data: {
        date: change.date,
        semester: change.semester,
        type: 'chapelAttendance',
        year: change.year,
      },
      title: isAttendance ? '✅ 채플 출석' : '⚠️ 채플 결석',
    };
  },
});

/**
 * 출석 상태에 따른 변경 유형 결정
 * u-saint에서 출석 상태는 '출석', '결석' 또는 null(미결) 중 하나
 * @param attendance 출석 상태 문자열
 * @returns 'attendance' | 'absence'
 */
const determineChangeType = (attendance: null | string): 'absence' | 'attendance' => {
  // u-saint에서는 출석 상태가 정확히 '출석'인 경우만 출석으로 처리
  // '결석' 또는 null(미결)은 모두 결석으로 처리
  return attendance === '출석' ? 'attendance' : 'absence';
};

/**
 * 날짜 문자열 포맷팅
 * @param dateStr 날짜 문자열 (예: '2024-03-15')
 * @returns 포맷된 날짜 (예: '3월 15일')
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  } catch {
    return dateStr;
  }
};
