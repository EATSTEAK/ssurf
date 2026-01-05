import {
  ClassGrade,
  CourseGradesApplicationInterface,
  CourseType,
  GradeSummary,
  SemesterGrade,
} from '@rusaint/react-native';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { classGrades, gradeSummary, semesterGrades } from '@/entities/grades/model';
import { cache } from '@/shared/model/schema/cache';

/**
 * 전체 학기의 성적 요약을 동기화합니다.
 * 증명 평점과 학적부 평점 두 가지 타입의 성적 요약을 가져와 저장합니다.
 */
export const syncGradeSummary = async (
  client: CourseGradesApplicationInterface,
  studentId: string,
  courseType: CourseType,
) => {
  // 증명 평점 정보 가져오기
  const certificated: GradeSummary = await client.certificatedSummary(courseType);

  // 학적부 평점 정보 가져오기
  const recorded: GradeSummary = await client.recordedSummary(courseType);

  // 트랜잭션으로 아토믹하게 처리
  await db.transaction(async (tx) => {
    // 기존 데이터 삭제
    await tx
      .delete(gradeSummary)
      .where(and(eq(gradeSummary.studentId, studentId), eq(gradeSummary.type, 'certificated')))
      .execute();
    await tx
      .delete(gradeSummary)
      .where(and(eq(gradeSummary.studentId, studentId), eq(gradeSummary.type, 'recorded')))
      .execute();

    // 증명 평점 저장
    await tx
      .insert(gradeSummary)
      .values({
        studentId,
        type: 'certificated',
        ...certificated,
      })
      .execute();

    // 학적부 평점 저장
    await tx
      .insert(gradeSummary)
      .values({
        studentId,
        type: 'recorded',
        ...recorded,
      })
      .execute();

    // 캐시 업데이트
    await tx
      .insert(cache)
      .values({
        studentId,
        key: `grades.summary.${courseType}`,
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: {
          updatedAt: Date.now(),
        },
      })
      .execute();
  });
};

/**
 * 특정 학기의 성적 정보를 동기화합니다.
 * 학기별 성적과 과목별 성적을 가져와 저장합니다.
 */
export const syncSemesterGrades = async (
  client: CourseGradesApplicationInterface,
  studentId: string,
  courseType: CourseType,
) => {
  // 학기별 성적 목록 가져오기
  const semesters: SemesterGrade[] = await client.semesters(courseType);

  // 트랜잭션으로 아토믹하게 처리
  await db.transaction(async (tx) => {
    // 기존 학기별 성적 데이터 삭제
    await tx.delete(semesterGrades).where(eq(semesterGrades.studentId, studentId)).execute();

    // 학기별 성적 저장
    await tx
      .insert(semesterGrades)
      .values(
        semesters.map((sem) => ({
          studentId,
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

    // 캐시 업데이트
    const cacheKey = `grades.semester.${courseType}`;
    await tx
      .insert(cache)
      .values({
        studentId,
        key: cacheKey,
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: {
          updatedAt: Date.now(),
        },
      })
      .execute();
  });
};

export const syncClassGrades = async (
  client: CourseGradesApplicationInterface,
  studentId: string,
  courseType: CourseType,
  year: number,
  semester: number,
) => {
  // 과목별 성적 가져오기
  const classes: ClassGrade[] = await client.classes(courseType, year, semester, true);

  // 트랜잭션으로 아토믹하게 처리
  await db.transaction(async (tx) => {
    // 기존 과목별 성적 데이터 삭제
    await tx
      .delete(classGrades)
      .where(
        and(
          eq(classGrades.studentId, studentId),
          eq(classGrades.year, year),
          eq(classGrades.semester, semester),
        ),
      )
      .execute();

    // 과목별 성적 저장
    if (classes.length > 0) {
      await tx
        .insert(classGrades)
        .values(
          classes.map((classGrade) => ({
            studentId,
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
    const cacheKey = `grades.classes.${courseType}.${year}.${semester}`;
    await tx
      .insert(cache)
      .values({
        studentId,
        key: cacheKey,
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: {
          updatedAt: Date.now(),
        },
      })
      .execute();
  });
};
