import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const cache = sqliteTable('cache', {
  key: t.text().primaryKey(),
  updatedAt: t.integer(),
});
