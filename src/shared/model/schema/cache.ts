import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const cache = sqliteTable(
  'cache',
  {
    studentId: t.integer().notNull(),
    key: t.text().notNull(),
    updatedAt: t.integer(),
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.key] })],
);
