/**
 * 과목별 성적 변경 알림 정의
 * 개별 과목의 성적(등급)이 변경되었을 때 알림 발송
 */

import type { ClassGradeChange } from '../model';

import { CourseGradesApplicationBuilder, CourseType } from '@rusaint/react-native';

import { db } from '@/db';
import { syncClassGrades } from '@/entities/grades/service';

import { defineNotification } from '../lib/defineNotification';

/**
 * 과목별 성적 변경 알림
 *
 * - 기존 성적 데이터와 새로 sync한 데이터 비교
 * - 최종 성적이 게시되지 않은 학기(현재 학기)만 대상
 * - 등급 변경 시 알림 발송
 */
export const classGradeNotification = defineNotification<ClassGradeChange>({
  key: 'classGrade',
  settingPath: 'grades.classGrade',

  check: async (ctx) => {
    const { session, studentId, currentSemester } = ctx;
    const changes: ClassGradeChange[] = [];

    // 성적 클라이언트 생성
    const gradesClient = await new CourseGradesApplicationBuilder().build(session);

    // 현재 학기 및 이전 학기 중 최종 성적이 게시되지 않은 학기 확인
    // 일반적으로 현재 학기의 성적만 변경 가능
    const { year, semester } = currentSemester;

    // 기존 과목별 성적 조회
    const existingGrades = await db.query.classGrades.findMany({
      where: (table, { and, eq }) =>
        and(eq(table.studentId, studentId), eq(table.year, year), eq(table.semester, semester)),
    });

    // 기존 성적을 Map으로 변환 (과목코드 → 등급)
    const existingGradesMap = new Map(existingGrades.map((g) => [g.code, g.rank]));

    // 최신 성적 동기화
    await syncClassGrades(gradesClient, studentId, CourseType.Bachelor, year, semester);

    // 동기화된 최신 성적 조회
    const newGrades = await db.query.classGrades.findMany({
      where: (table, { and, eq }) =>
        and(eq(table.studentId, studentId), eq(table.year, year), eq(table.semester, semester)),
    });

    // 성적 변경 감지
    for (const newGrade of newGrades) {
      const previousRank = existingGradesMap.get(newGrade.code);

      // 새로 등록된 과목 또는 등급이 변경된 경우
      if (previousRank === undefined || previousRank !== newGrade.rank) {
        changes.push({
          className: newGrade.className,
          code: newGrade.code,
          newRank: newGrade.rank,
          previousRank: previousRank ?? null,
          semester: newGrade.semester,
          year: newGrade.year,
        });
      }
    }

    return changes;
  },

  notify: (change) => {
    const isNew = change.previousRank === null;

    return {
      body: isNew
        ? `${change.className} 과목의 성적이 ${change.newRank}(으)로 등록되었습니다.`
        : `${change.className} 과목의 성적이 ${change.previousRank}에서 ${change.newRank}(으)로 변경되었습니다.`,
      data: {
        code: change.code,
        semester: change.semester,
        type: 'classGrade',
        year: change.year,
      },
      title: isNew ? '📝 성적 등록' : '📊 성적 변경',
    };
  },
});

/**
 * 최종 성적이 게시되지 않은 학기 목록 조회
 * semesterRank가 null인 학기가 아직 최종 성적이 게시되지 않은 학기
 */
export const getUnfinalizedSemesters = async (
  studentId: string,
): Promise<Array<{ semester: number; year: number }>> => {
  const semesters = await db.query.semesterGrades.findMany({
    where: (table, { eq }) => eq(table.studentId, studentId),
  });

  // semesterRankFirst가 null인 학기 = 최종 성적 미게시 학기
  return semesters
    .filter((s) => s.semesterRankFirst === null)
    .map((s) => ({ semester: s.semester, year: s.year }));
};
