import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const feedSites = sqliteTable('feed_sites', {
  slug: t.text().primaryKey(),
  title: t.text().notNull(),
  description: t.text(),
  source: t.text(),
  itemCount: t.integer().default(0),
  kind: t.text({ enum: ['calendar', 'notice'] }).notNull(),
});

export type FeedSiteEntity = typeof feedSites.$inferSelect;

export const feedNotices = sqliteTable(
  'feed_notices',
  {
    slug: t.text().notNull(),
    id: t.text().notNull(),
    title: t.text().notNull(),
    description: t.text(),
    url: t.text(),
    createdAt: t.integer(),
    updatedAt: t.integer(),
    author: t.text(),
    thumbnail: t.text(),
    categoriesJson: t.text(),
    metadataJson: t.text(),
  },
  (table) => [t.primaryKey({ columns: [table.slug, table.id] })],
);

export type FeedNoticeEntity = typeof feedNotices.$inferSelect;
export type FeedNoticeListItem = Pick<
  FeedNoticeEntity,
  'author' | 'createdAt' | 'description' | 'id' | 'slug' | 'title' | 'updatedAt' | 'url'
>;
