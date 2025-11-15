import {
  ClassGrade,
  CourseGradesApplicationInterface,
  CourseType,
  GradeSummary,
  SemesterGrade,
} from '@rusaint/react-native';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { cache } from '@/db/schema/cache';
import { classGrades, gradeSummary, semesterGrades } from '@/db/schema/grades';

/**
 * 전체 학기의 성적 요약을 동기화합니다.
 * certificated와 recorded 두 가지 타입의 성적 요약을 가져와 저장합니다.
 */
export const syncGradeSummary = async (
  client: CourseGradesApplicationInterface,
  courseType: CourseType,
) => {
  // 증명 평점 정보 가져오기
  const certificated: GradeSummary = await client.certificatedSummary(courseType);

  // 학적부 평점 정보 가져오기
  const recorded: GradeSummary = await client.recordedSummary(courseType);

  // 기존 데이터 삭제
  await db.delete(gradeSummary).where(eq(gradeSummary.type, 'certificated')).execute();
  await db.delete(gradeSummary).where(eq(gradeSummary.type, 'recorded')).execute();

  // 증명 평점 저장
  await db
    .insert(gradeSummary)
    .values({
      type: 'certificated',
      attemptedCredits: certificated.attemptedCredits,
      earnedCredits: certificated.earnedCredits,
      gradePointsSum: certificated.gradePointsSum,
      gradePointsAverage: certificated.gradePointsAverage,
      arithmeticMean: certificated.arithmeticMean,
      pfEarnedCredits: certificated.pfEarnedCredits,
    })
    .execute();

  // 학적부 평점 저장
  await db
    .insert(gradeSummary)
    .values({
      type: 'recorded',
      attemptedCredits: recorded.attemptedCredits,
      earnedCredits: recorded.earnedCredits,
      gradePointsSum: recorded.gradePointsSum,
      gradePointsAverage: recorded.gradePointsAverage,
      arithmeticMean: recorded.arithmeticMean,
      pfEarnedCredits: recorded.pfEarnedCredits,
    })
    .execute();

  // 캐시 업데이트 - certificated
  await db
    .insert(cache)
    .values({
      key: 'grades.summary.certificated',
      updatedAt: Date.now(),
    })
    .onConflictDoUpdate({
      target: cache.key,
      set: {
        updatedAt: Date.now(),
      },
    })
    .execute();

  // 캐시 업데이트 - recorded
  await db
    .insert(cache)
    .values({
      key: 'grades.summary.recorded',
      updatedAt: Date.now(),
    })
    .onConflictDoUpdate({
      target: cache.key,
      set: {
        updatedAt: Date.now(),
      },
    })
    .execute();
};

/**
 * 특정 학기의 성적 정보를 동기화합니다.
 * 학기별 성적과 과목별 성적을 가져와 저장합니다.
 */
export const syncSemesterGrades = async (
  client: CourseGradesApplicationInterface,
  courseType: CourseType,
) => {
  // 학기별 성적 목록 가져오기
  const semesters: SemesterGrade[] = await client.semesters(courseType);

  // 기존 학기별 성적 데이터 삭제
  await db.delete(semesterGrades).execute();

  // 학기별 성적 저장
  await db
    .insert(semesterGrades)
    .values(
      semesters.map((sem) => ({
        year: sem.year,
        semester: sem.semester,
        attemptedCredits: sem.attemptedCredits,
        earnedCredits: sem.earnedCredits,
        pfEarnedCredits: sem.pfEarnedCredits,
        gradePointsAverage: sem.gradePointsAverage,
        gradePointsSum: sem.gradePointsSum,
        arithmeticMean: sem.arithmeticMean,
        semesterRankFirst: sem.semesterRank?.first ?? null,
        semesterRankSecond: sem.semesterRank?.second ?? null,
        generalRankFirst: sem.generalRank?.first ?? null,
        generalRankSecond: sem.generalRank?.second ?? null,
        academicProbation: sem.academicProbation ? 1 : 0,
        consult: sem.consult ? 1 : 0,
        flunked: sem.flunked ? 1 : 0,
      })),
    )
    .execute();
};

export const syncClassGrades = async (
  client: CourseGradesApplicationInterface,
  courseType: CourseType,
  year: number,
  semester: number,
) => {
  // 과목별 성적 가져오기
  const classes: ClassGrade[] = await client.classes(courseType, year, semester, true);

  // 기존 과목별 성적 데이터 삭제
  await db
    .delete(classGrades)
    .where(and(eq(classGrades.year, year), eq(classGrades.semester, semester)))
    .execute();

  // 과목별 성적 저장
  if (classes.length > 0) {
    await db
      .insert(classGrades)
      .values(
        classes.map((classGrade) => ({
          year: classGrade.year,
          semester: classGrade.semester,
          code: classGrade.code,
          className: classGrade.className,
          gradePoints: classGrade.gradePoints,
          scoreType: classGrade.score.tag,
          scoreValue: classGrade.score.tag === 'Score' ? classGrade.score.inner[0] : null,
          rank: classGrade.rank,
          professor: classGrade.professor,
          detailJson: classGrade.detail
            ? JSON.stringify(Object.fromEntries(classGrade.detail))
            : null,
        })),
      )
      .execute();
  }

  // 캐시 업데이트
  const cacheKey = `grades.semester.${year}-${semester}`;
  await db
    .insert(cache)
    .values({
      key: cacheKey,
      updatedAt: Date.now(),
    })
    .onConflictDoUpdate({
      target: cache.key,
      set: {
        updatedAt: Date.now(),
      },
    })
    .execute();
};
