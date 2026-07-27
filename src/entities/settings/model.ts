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

export const settingsSchema = {
  'feed.selectedNoticeSlug': {
    defaultValue: 'scatch.ssu.ac.kr',
  },
  'feed.selectedNoticeSlugs': {
    defaultValue: ['scatch.ssu.ac.kr'],
  },
  'notifications.chapel.enabled': {
    defaultValue: true,
  },
  'notifications.courseGrade.enabled': {
    defaultValue: true,
  },
  'notifications.notice.enabled': {
    defaultValue: true,
  },
  'notifications.semesterGrade.enabled': {
    defaultValue: true,
  },
  'schedule.selectedCalendarSlugs': {
    defaultValue: ['calendar/ssu-academic-calendar'],
  },
};

export type SettingsKey = keyof typeof settingsSchema;
export type SettingsValueMap = {
  [K in SettingsKey]: (typeof settingsSchema)[K]['defaultValue'];
};
export type SettingsValue<K extends SettingsKey> = SettingsValueMap[K];
