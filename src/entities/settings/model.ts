import * as t from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable(
  'settings',
  {
    studentId: t.text().notNull(),
    key: t.text().notNull(),
    valueJson: t.text().notNull(),
    updatedAt: t.integer().notNull(),
  },
  (table) => [t.primaryKey({ columns: [table.studentId, table.key] })],
);

export type SettingsEntity = typeof settings.$inferSelect;

export type SettingsValueMap = {
  selectedCalendarSlugs: string[];
  selectedNoticeSlug: string;
  selectedNoticeSlugs: string[];
};

export type SettingsKey = keyof SettingsValueMap;
export type SettingsValue<K extends SettingsKey> = SettingsValueMap[K];

export const settingsSchema: {
  [K in SettingsKey]: {
    defaultValue: SettingsValue<K>;
    storageKey: string;
  };
} = {
  selectedCalendarSlugs: {
    defaultValue: ['calendar/ssu-academic-calendar'],
    storageKey: 'feed.selectedCalendarSlugs',
  },
  selectedNoticeSlug: {
    defaultValue: 'scatch.ssu.ac.kr',
    storageKey: 'feed.selectedNoticeSlug',
  },
  selectedNoticeSlugs: {
    defaultValue: ['scatch.ssu.ac.kr'],
    storageKey: 'feed.selectedNoticeSlugs',
  },
};
