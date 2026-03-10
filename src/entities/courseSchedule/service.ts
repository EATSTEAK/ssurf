import { PersonalCourseScheduleApplicationInterface, SemesterType } from '@rusaint/react-native';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { courseSchedule } from '@/entities/courseSchedule/model';
import { cache } from '@/shared/model/schema/cache';

const parseTimeToMinutes = (time: string): null | { endMinutes: number; startMinutes: number } => {
  const match = time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }
  return {
    startMinutes: parseInt(match[1], 10) * 60 + parseInt(match[2], 10),
    endMinutes: parseInt(match[3], 10) * 60 + parseInt(match[4], 10),
  };
};

const MERGE_GAP_MINUTES = 15;

const mergeScheduleRows = (
  rows: (typeof courseSchedule.$inferInsert)[],
): (typeof courseSchedule.$inferInsert)[] => {
  const groupMap = new Map<string, (typeof courseSchedule.$inferInsert)[]>();

  for (const row of rows) {
    const key = `${row.studentId}|${row.year}|${row.semester}|${row.weekday}|${row.name}|${row.professor}|${row.classroom}`;
    const group = groupMap.get(key) ?? [];
    group.push(row);
    groupMap.set(key, group);
  }

  const merged: (typeof courseSchedule.$inferInsert)[] = [];

  for (const group of groupMap.values()) {
    group.sort((a, b) => a.startTime - b.startTime);

    let current = { ...group[0] };
    for (let i = 1; i < group.length; i++) {
      const next = group[i];
      if (next.startTime - current.endTime <= MERGE_GAP_MINUTES) {
        current.endTime = Math.max(current.endTime, next.endTime);
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    merged.push(current);
  }

  return merged;
};

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

    const rawRows: (typeof courseSchedule.$inferInsert)[] = [];
    for (const [weekday, courses] of result.schedule) {
      for (const course of courses) {
        const parsed = parseTimeToMinutes(course.time);
        if (!parsed) {
          continue;
        }
        rawRows.push({
          studentId,
          year,
          semester,
          weekday,
          name: course.name,
          professor: course.professor,
          startTime: parsed.startMinutes,
          endTime: parsed.endMinutes,
          classroom: course.classroom,
        });
      }
    }

    const rows = mergeScheduleRows(rawRows);

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
