import { PersonalCourseScheduleApplicationInterface, SemesterType } from '@rusaint/react-native';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { courseSchedule } from '@/entities/courseSchedule/model';
import { cache } from '@/shared/model/schema/cache';

export const syncCourseSchedule = async (
  client: PersonalCourseScheduleApplicationInterface,
  studentId: string,
  year: number,
  semester: SemesterType,
) => {
  const result = await client.schedule(year, semester);

  await db.transaction(async (tx) => {
    await tx
      .delete(courseSchedule)
      .where(
        and(
          eq(courseSchedule.studentId, studentId),
          eq(courseSchedule.year, year),
          eq(courseSchedule.semester, semester),
        ),
      )
      .execute();

    const rows: (typeof courseSchedule.$inferInsert)[] = [];
    for (const [weekday, courses] of result.schedule) {
      for (const course of courses) {
        rows.push({
          studentId,
          year,
          semester,
          weekday,
          name: course.name,
          professor: course.professor,
          time: course.time,
          classroom: course.classroom,
        });
      }
    }

    if (rows.length > 0) {
      await tx.insert(courseSchedule).values(rows).onConflictDoNothing().execute();
    }

    const cacheKey = `personalCourseSchedule.${year}-${semester}`;
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
