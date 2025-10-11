import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const chapelGeneral = sqliteTable(
  'chapel_general',
  {
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
  (table) => [t.primaryKey({ columns: [table.year, table.semester] })],
);

export const chapelAttendances = sqliteTable(
  'chapel_attendances',
  {
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
  (table) => [t.primaryKey({ columns: [table.year, table.semester, table.date] })],
);

// TODO: create chapel_absence_requests table
