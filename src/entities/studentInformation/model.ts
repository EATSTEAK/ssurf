import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const studentInformation = sqliteTable('student_information', {
  applyYear: t.integer().notNull(),
  studentNumber: t.integer().primaryKey(),
  name: t.text().notNull(),
  rrn: t.integer().notNull(),
  college: t.text().notNull(),
  department: t.text().notNull(),
  major: t.text(),
  division: t.text(),
  grade: t.integer().notNull(),
  term: t.integer().notNull(),
  alias: t.text(),
  kanjiName: t.text(),
  email: t.text(),
  telNumber: t.text(),
  mobileNumber: t.text(),
  postCode: t.text(),
  address: t.text(),
  specificAddress: t.text(),
  isTransferStudent: t.integer().notNull(), // boolean as integer (0 or 1)
  applyDate: t.text().notNull(),
  appliedCollege: t.text().notNull(),
  appliedDepartment: t.text().notNull(),
  pluralMajor: t.text(),
  subMajor: t.text(),
  connectedMajor: t.text(),
  abeek: t.text(),
});

export type StudentInformationEntity = typeof studentInformation.$inferSelect;

export const studentAcademicRecords = sqliteTable(
  'student_academic_records',
  {
    studentId: t.text().notNull(),
    sequence: t.integer().notNull(),
    startDate: t.text().notNull(),
    endDate: t.text().notNull(),
    year: t.text().notNull(),
    term: t.text().notNull(),
    category: t.text().notNull(),
    reason: t.text().notNull(),
    processDate: t.text().notNull(),
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.sequence] })],
);

export type StudentAcademicRecordEntity = typeof studentAcademicRecords.$inferSelect;
