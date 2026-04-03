import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const calendars = sqliteTable(
  'feed_calendars',
  {
    slug: t.text().notNull(),
    id: t.text().notNull(),
    title: t.text().notNull(),
    description: t.text(),
    startsAt: t.integer(),
    endsAt: t.integer(),
    location: t.text(),
    url: t.text(),
  },
  (table) => [t.primaryKey({ columns: [table.slug, table.id] })],
);

export type CalendarEntity = typeof calendars.$inferSelect;
