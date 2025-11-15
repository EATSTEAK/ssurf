import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const scholarships = sqliteTable(
  'scholarships',
  {
    year: t.integer().notNull(),
    semester: t.integer().notNull(),
    name: t.text().notNull(),
    receivedAmount: t.text().notNull(), // u64 stored as string
    receiveType: t.text(),
    status: t.text(),
    processedAt: t.text(),
    selectedAmount: t.text(), // u64 stored as string
    refundedAmount: t.text(), // u64 stored as string
    replacedAmount: t.text(), // u64 stored as string
    replacedBy: t.text(),
    dropReason: t.text(),
    note: t.text(),
    workedAt: t.text(),
  },
  (table) => [t.primaryKey({ columns: [table.year, table.semester, table.name] })],
);

export type ScholarshipDto = typeof scholarships.$inferSelect;
