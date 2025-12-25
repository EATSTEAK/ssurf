import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const studentInformation = sqliteTable(
  'student_information',
  {
    applyYear: t.integer().notNull(),
    studentNumber: t.integer().notNull(),
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
  },
  (table) => [t.primaryKey({ columns: [table.studentNumber] })],
);

export type StudentInformationEntity = typeof studentInformation.$inferSelect;
