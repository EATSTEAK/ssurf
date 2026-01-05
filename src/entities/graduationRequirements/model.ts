import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const graduationRequirementsGeneral = sqliteTable(
  'graduation_requirements_general',
  {
    studentId: t.text().notNull(),
    isGraduatable: t.integer().notNull(), // SQLite doesn't have boolean, use integer (0/1)
    updatedAt: t.integer().notNull(),
  },
  (table) => [t.primaryKey({ columns: [table.studentId] })],
);

export type GraduationRequirementsGeneralEntity = typeof graduationRequirementsGeneral.$inferSelect;

export const graduationRequirements = sqliteTable(
  'graduation_requirements',
  {
    studentId: t.text().notNull(),
    name: t.text().notNull(),
    requirement: t.integer(), // nullable
    calculation: t.real(), // nullable
    difference: t.real(), // nullable
    result: t.integer().notNull(), // boolean as integer
    category: t.text().notNull(),
    lectures: t.text().notNull(), // JSON string array
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.name] })],
);

export type GraduationRequirementEntity = typeof graduationRequirements.$inferSelect;

export const graduationStudent = sqliteTable(
  'graduation_student',
  {
    studentId: t.text().notNull(),
    number: t.integer().notNull(),
    name: t.text().notNull(),
    grade: t.integer().notNull(),
    semester: t.integer().notNull(),
    status: t.text().notNull(),
    applyYear: t.integer().notNull(),
    applyType: t.text().notNull(),
    department: t.text().notNull(),
    majors: t.text().notNull(), // JSON string array
    auditDate: t.text().notNull(),
    graduationPoints: t.real().notNull(),
    completedPoints: t.real().notNull(),
  },
  (table) => [t.primaryKey({ columns: [table.studentId] })],
);

export type GraduationStudentEntity = typeof graduationStudent.$inferSelect;
