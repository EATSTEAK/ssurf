import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

/**
 * 전체 성적 요약 테이블 (학적부/증명)
 * GradeSummary 타입 기반
 */
export const gradeSummary = sqliteTable(
  'grade_summary',
  {
    studentId: t.text().notNull(),
    type: t.text().notNull(), // 'certificated' | 'recorded'
    attemptedCredits: t.real().notNull(), // 신청학점
    earnedCredits: t.real().notNull(), // 취득학점
    gradePointsSum: t.real().notNull(), // 평점계
    gradePointsAverage: t.real().notNull(), // 평점평균
    arithmeticMean: t.real().notNull(), // 산술평균
    pfEarnedCredits: t.real().notNull(), // P/F 학점계
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.type] })],
);

export type GradeSummaryEntity = typeof gradeSummary.$inferSelect;

/**
 * 학기별 성적 테이블
 * SemesterGrade 타입 기반
 */
export const semesterGrades = sqliteTable(
  'semester_grades',
  {
    studentId: t.text().notNull(),
    year: t.integer().notNull(), // 학년도
    semester: t.integer().notNull(), // 학기
    attemptedCredits: t.real().notNull(), // 신청학점
    earnedCredits: t.real().notNull(), // 취득학점
    pfEarnedCredits: t.real().notNull(), // P/F학점
    gradePointsAverage: t.real().notNull(), // 평점평균
    gradePointsSum: t.real().notNull(), // 평점계
    arithmeticMean: t.real().notNull(), // 산술평균
    semesterRankFirst: t.integer(), // 학기별석차 - first
    semesterRankSecond: t.integer(), // 학기별석차 - second
    generalRankFirst: t.integer(), // 전체석차 - first
    generalRankSecond: t.integer(), // 전체석차 - second
    academicProbation: t.integer().notNull(), // 학사경고 (boolean as integer)
    consult: t.integer().notNull(), // 상담여부 (boolean as integer)
    flunked: t.integer().notNull(), // 유급 (boolean as integer)
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.year, table.semester] })],
);

export type SemesterGradeEntity = typeof semesterGrades.$inferSelect;

/**
 * 과목별 성적 테이블
 * ClassGrade 타입 기반
 */
export const classGrades = sqliteTable(
  'class_grades',
  {
    studentId: t.text().notNull(),
    year: t.integer().notNull(), // 이수학년도
    semester: t.integer().notNull(), // 이수학기
    code: t.text().notNull(), // 과목코드
    className: t.text().notNull(), // 과목명
    gradePoints: t.real().notNull(), // 과목학점
    scoreType: t.text().notNull(), // 'Pass' | 'Failed' | 'Score' | 'Empty'
    scoreValue: t.integer(), // Score 타입일 경우의 점수값
    rank: t.text().notNull(), // 등급
    professor: t.text().notNull(), // 교수명
    detailJson: t.text(), // 상세성적 (JSON string of Map<string, number>)
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.year, table.semester, table.code] })],
);

export type ClassGradeEntity = typeof classGrades.$inferSelect;
