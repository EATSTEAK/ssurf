import {
  CourseScheduleApplicationLike,
  LectureCategoryBuilder,
  PersonalCourseScheduleApplicationInterface,
  SemesterType,
} from '@rusaint/react-native';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { loadCourseInformation } from '@/entities/courseSchedule/lib/courseInformationLoader';
import { courseInformation, courseSchedule, courseSyllabus } from '@/entities/courseSchedule/model';
import { cache } from '@/shared/model/schema/cache';

const courseScheduleQueues = new WeakMap<CourseScheduleApplicationLike, Promise<void>>();

const withCourseScheduleClient = <T>(
  client: CourseScheduleApplicationLike,
  operation: () => Promise<T>,
): Promise<T> => {
  const previous = courseScheduleQueues.get(client) ?? Promise.resolve();
  const result = previous.then(operation, operation);
  courseScheduleQueues.set(
    client,
    result.then(
      () => undefined,
      () => undefined,
    ),
  );
  return result;
};

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

export const syncCourseInformation = async (
  client: CourseScheduleApplicationLike,
  studentId: string,
  year: number,
  semester: SemesterType,
) => {
  const scheduledCourses = await db.query.courseSchedule.findMany({
    columns: { name: true },
    where: (courseSchedule, { and, eq }) =>
      and(
        eq(courseSchedule.studentId, studentId),
        eq(courseSchedule.year, year),
        eq(courseSchedule.semester, semester),
      ),
  });
  const result = await withCourseScheduleClient(client, () =>
    loadCourseInformation({
      courseNames: scheduledCourses.map(({ name }) => name),
      findByName: (name) =>
        client.findDetailedLectures(
          year,
          semester,
          new LectureCategoryBuilder().findByLecture(name),
          false,
        ),
    }),
  );
  const rows: (typeof courseInformation.$inferInsert)[] = result.map(({ detail, lecture }) => ({
    studentId,
    year,
    semester,
    code: lecture.code,
    division: lecture.division ?? '',
    name: lecture.name,
    professor: lecture.professor,
    scheduleRoom: lecture.scheduleRoom,
    lecture,
    detail,
  }));

  await db.transaction(async (tx) => {
    await tx
      .delete(courseInformation)
      .where(
        and(
          eq(courseInformation.studentId, studentId),
          eq(courseInformation.year, year),
          eq(courseInformation.semester, semester),
        ),
      )
      .execute();

    for (let index = 0; index < rows.length; index += 90) {
      await tx
        .insert(courseInformation)
        .values(rows.slice(index, index + 90))
        .onConflictDoNothing()
        .execute();
    }

    const cacheKey = `courseInformation.${year}-${semester}`;
    await tx
      .insert(cache)
      .values({ studentId, key: cacheKey, updatedAt: Date.now() })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: { updatedAt: Date.now() },
      })
      .execute();
  });
};

export const syncCourseSyllabus = async (
  client: CourseScheduleApplicationLike,
  studentId: string,
  year: number,
  semester: SemesterType,
  code: string,
  name: string,
) => {
  const data = await withCourseScheduleClient(client, async () => {
    const category = new LectureCategoryBuilder().findByLecture(name);
    const lectures = await client.findLectures(year, semester, category);
    if (!lectures.some((lecture) => lecture.code === code)) {
      throw new Error('강의 정보를 찾을 수 없어요.');
    }
    return client.lectureSyllabus(code);
  });
  const cacheKey = `courseSyllabus.${year}-${semester}-${code}`;

  await db.transaction(async (tx) => {
    await tx
      .insert(courseSyllabus)
      .values({ studentId, year, semester, code, data })
      .onConflictDoUpdate({
        target: [
          courseSyllabus.studentId,
          courseSyllabus.year,
          courseSyllabus.semester,
          courseSyllabus.code,
        ],
        set: { data },
      })
      .execute();

    await tx
      .insert(cache)
      .values({ studentId, key: cacheKey, updatedAt: Date.now() })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: { updatedAt: Date.now() },
      })
      .execute();
  });
};
