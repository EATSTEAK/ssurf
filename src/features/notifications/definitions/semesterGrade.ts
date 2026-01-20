/**
 * 학기별 성적 업데이트 알림 정의
 * 학기 전체 성적 요약(GPA, 취득학점)이 변경되었을 때 알림 발송
 */

import type { SemesterGradeChange } from '../model';

import { CourseGradesApplicationBuilder, CourseType } from '@rusaint/react-native';

import { db } from '@/db';
import { syncSemesterGrades } from '@/entities/grades/service';

import { defineNotification } from '../lib/defineNotification';

/**
 * 학기별 성적 업데이트 알림
 *
 * - 학기별 GPA나 총 학점 변경 감지
 * - 기존 데이터와 새로 sync한 데이터 비교
 */
export const semesterGradeNotification = defineNotification<SemesterGradeChange>({
  key: 'semesterGrade',
  settingPath: 'grades.semesterGrade',

  check: async (ctx) => {
    const { session, studentId } = ctx;
    const changes: SemesterGradeChange[] = [];

    // 성적 클라이언트 생성
    const gradesClient = await new CourseGradesApplicationBuilder().build(session);

    // 기존 학기별 성적 조회
    const existingSemesters = await db.query.semesterGrades.findMany({
      where: (table, { eq }) => eq(table.studentId, studentId),
    });

    // 기존 성적을 Map으로 변환 (year-semester → {gpa, credits})
    const existingSemestersMap = new Map(
      existingSemesters.map((s) => [
        `${s.year}-${s.semester}`,
        {
          credits: s.earnedCredits,
          gpa: s.gradePointsAverage,
        },
      ]),
    );

    // 최신 학기별 성적 동기화
    await syncSemesterGrades(gradesClient, studentId, CourseType.Bachelor, true);

    // 동기화된 최신 학기별 성적 조회
    const newSemesters = await db.query.semesterGrades.findMany({
      where: (table, { eq }) => eq(table.studentId, studentId),
    });

    // 성적 변경 감지
    for (const newSemester of newSemesters) {
      const key = `${newSemester.year}-${newSemester.semester}`;
      const existing = existingSemestersMap.get(key);

      // 새 학기 또는 GPA/취득학점 변경된 경우
      if (
        !existing ||
        existing.gpa !== newSemester.gradePointsAverage ||
        existing.credits !== newSemester.earnedCredits
      ) {
        changes.push({
          newCredits: newSemester.earnedCredits,
          newGpa: newSemester.gradePointsAverage,
          previousCredits: existing?.credits ?? null,
          previousGpa: existing?.gpa ?? null,
          semester: newSemester.semester,
          year: newSemester.year,
        });
      }
    }

    return changes;
  },

  notify: (change) => {
    const isNew = change.previousGpa === null;
    const semesterText = getSemesterText(change.semester);

    if (isNew) {
      return {
        body: `${change.year}년 ${semesterText} 성적이 등록되었습니다. 평점: ${change.newGpa.toFixed(2)}, 취득학점: ${change.newCredits}`,
        data: {
          semester: change.semester,
          type: 'semesterGrade',
          year: change.year,
        },
        title: '📚 학기 성적 등록',
      };
    }

    // 변경 내용 설명
    const gpaChanged = change.previousGpa !== change.newGpa;
    const creditsChanged = change.previousCredits !== change.newCredits;

    let bodyText = `${change.year}년 ${semesterText} 성적이 업데이트되었습니다.`;
    if (gpaChanged) {
      bodyText += ` 평점: ${change.previousGpa?.toFixed(2)} → ${change.newGpa.toFixed(2)}`;
    }
    if (creditsChanged) {
      bodyText += ` 취득학점: ${change.previousCredits} → ${change.newCredits}`;
    }

    return {
      body: bodyText,
      data: {
        semester: change.semester,
        type: 'semesterGrade',
        year: change.year,
      },
      title: '📊 학기 성적 업데이트',
    };
  },
});

/**
 * 학기 번호를 텍스트로 변환
 * @param semester 학기 번호 (1, 2, 3, 4)
 * @returns 학기 텍스트 ('1학기', '여름학기', '2학기', '겨울학기')
 */
const getSemesterText = (semester: number): string => {
  switch (semester) {
    case 1:
      return '1학기';
    case 2:
      return '여름학기';
    case 3:
      return '2학기';
    case 4:
      return '겨울학기';
    default:
      return `${semester}학기`;
  }
};
