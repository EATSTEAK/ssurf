import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const chapelGeneral = sqliteTable('chapel_general', {
  year: t.integer(),
  semester: t.integer(),
  division: t.integer(),
  time: t.text(),
  room: t.text(),
  floor: t.integer(),
  seat: t.text(),
  absenceTime: t.integer(),
  result: t.text(),
  note: t.text(),
});

export const chapelAttendances = sqliteTable('chapel_attendances', {
  year: t.integer(),
  semester: t.integer(),
  date: t.text(),
  division: t.integer(),
  category: t.text(),
  instructor: t.text(),
  instructorDepartment: t.text(),
  title: t.text(),
  attendance: t.text(),
  result: t.text(),
  note: t.text(),
});

// TODO: create chapel_absence_requests table
