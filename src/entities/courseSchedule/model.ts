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

export type CourseScheduleEntity = typeof courseSchedule.$inferSelect;
