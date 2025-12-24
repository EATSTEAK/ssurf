import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const graduationRequirementsGeneral = sqliteTable('graduation_requirements_general', {
  id: t.integer().primaryKey({ autoIncrement: true }),
  isGraduatable: t.integer().notNull(), // SQLite doesn't have boolean, use integer (0/1)
  updatedAt: t.integer().notNull(),
});

export type GraduationRequirementsGeneralModel = typeof graduationRequirementsGeneral.$inferSelect;

export const graduationRequirements = sqliteTable('graduation_requirements', {
  id: t.integer().primaryKey({ autoIncrement: true }),
  name: t.text().notNull(),
  requirement: t.integer(), // nullable
  calculation: t.real(), // nullable
  difference: t.real(), // nullable
  result: t.integer().notNull(), // boolean as integer
  category: t.text().notNull(),
  lectures: t.text().notNull(), // JSON string array
});

export type GraduationRequirementModel = typeof graduationRequirements.$inferSelect;

export const graduationStudent = sqliteTable('graduation_student', {
  id: t.integer().primaryKey({ autoIncrement: true }),
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
});

export type GraduationStudentModel = typeof graduationStudent.$inferSelect;
