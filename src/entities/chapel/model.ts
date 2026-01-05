import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const chapelGeneral = sqliteTable(
  'chapel_general',
  {
    studentId: t.text().notNull(),
    year: t.integer().notNull(),
    semester: t.integer().notNull(),
    division: t.integer(),
    time: t.text(),
    room: t.text(),
    floor: t.integer(),
    seat: t.text(),
    absenceTime: t.integer(),
    result: t.text(),
    note: t.text(),
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.year, table.semester] })],
);

export type ChapelGeneralEntity = typeof chapelGeneral.$inferSelect;

export const chapelAttendances = sqliteTable(
  'chapel_attendances',
  {
    studentId: t.text().notNull(),
    year: t.integer().notNull(),
    semester: t.integer().notNull(),
    date: t.text().notNull(),
    division: t.integer(),
    category: t.text(),
    instructor: t.text(),
    instructorDepartment: t.text(),
    title: t.text(),
    attendance: t.text(),
    result: t.text(),
    note: t.text(),
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.year, table.semester, table.date] })],
);

export type ChapelAttendanceEntity = typeof chapelAttendances.$inferSelect;

// TODO: create chapel_absence_requests table
