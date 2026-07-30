import type { Lecture, LectureDetail, LectureSyllabus } from '@rusaint/react-native';

import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const courseSchedule = sqliteTable(
  'personal_course_schedule',
  {
    studentId: t.text().notNull(),
    year: t.integer().notNull(),
    semester: t.integer().notNull(),
    weekday: t.integer().notNull(),
    name: t.text().notNull(),
    professor: t.text().notNull(),
    startTime: t.integer().notNull(),
    endTime: t.integer().notNull(),
    classroom: t.text().notNull(),
  },
  (table) => [
    t.primaryKey({
      columns: [
        table.studentId,
        table.year,
        table.semester,
        table.weekday,
        table.name,
        table.startTime,
      ],
    }),
  ],
);

export const courseInformation = sqliteTable(
  'course_information',
  {
    studentId: t.text().notNull(),
    year: t.integer().notNull(),
    semester: t.integer().notNull(),
    code: t.text().notNull(),
    division: t.text().notNull(),
    name: t.text().notNull(),
    professor: t.text().notNull(),
    scheduleRoom: t.text().notNull(),
    lecture: t.text({ mode: 'json' }).$type<Lecture>().notNull(),
    detail: t.text({ mode: 'json' }).$type<LectureDetail>(),
  },
  (table) => [
    t.primaryKey({
      columns: [table.studentId, table.year, table.semester, table.code, table.division],
    }),
  ],
);

export const courseSyllabus = sqliteTable(
  'course_syllabus',
  {
    studentId: t.text().notNull(),
    year: t.integer().notNull(),
    semester: t.integer().notNull(),
    code: t.text().notNull(),
    data: t.text({ mode: 'json' }).$type<LectureSyllabus>().notNull(),
  },
  (table) => [
    t.primaryKey({
      columns: [table.studentId, table.year, table.semester, table.code],
    }),
  ],
);

export type CourseInformationEntity = typeof courseInformation.$inferSelect;
export type CourseScheduleEntity = typeof courseSchedule.$inferSelect;
