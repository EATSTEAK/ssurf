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
    time: t.text().notNull(),
    classroom: t.text().notNull(),
  },
  (table) => [
    t.primaryKey({
      columns: [table.studentId, table.year, table.semester, table.weekday, table.name, table.time],
    }),
  ],
);

export type CourseScheduleEntity = typeof courseSchedule.$inferSelect;
