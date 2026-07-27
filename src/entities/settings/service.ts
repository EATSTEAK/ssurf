import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import {
  settings,
  SettingsKey,
  settingsSchema,
  SettingsValue,
  SettingsValueMap,
} from '@/entities/settings/model';

const parseSettingValue = <K extends SettingsKey>(key: K, valueJson: string): SettingsValue<K> => {
  try {
    return JSON.parse(valueJson) as SettingsValue<K>;
  } catch {
    return settingsSchema[key].defaultValue as SettingsValue<K>;
  }
};

export const getSettingSnapshot = async <K extends SettingsKey>(
  studentId: string,
  key: K,
): Promise<SettingsValue<K>> => {
  const row = await db.query.settings.findFirst({
    where: (setting, { and, eq }) => and(eq(setting.studentId, studentId), eq(setting.key, key)),
  });

  if (!row) {
    return settingsSchema[key].defaultValue as SettingsValue<K>;
  }

  return parseSettingValue(key, row.valueJson);
};

export const setSetting = async <K extends SettingsKey>(
  studentId: string,
  key: K,
  value: SettingsValue<K>,
) => {
  const updatedAt = Date.now();

  await db
    .insert(settings)
    .values({
      studentId,
      key,
      valueJson: JSON.stringify(value),
      updatedAt,
    })
    .onConflictDoUpdate({
      target: [settings.studentId, settings.key],
      set: {
        valueJson: JSON.stringify(value),
        updatedAt,
      },
    });
};

export const setSettings = async (studentId: string, values: Partial<SettingsValueMap>) => {
  const entries = Object.entries(values) as [SettingsKey, SettingsValue<SettingsKey> | undefined][];

  if (entries.length === 0) {
    return;
  }

  const updatedAt = Date.now();

  await db.transaction(async (tx) => {
    for (const [key, value] of entries) {
      if (value === undefined) {
        continue;
      }

      await tx
        .insert(settings)
        .values({
          studentId,
          key,
          valueJson: JSON.stringify(value),
          updatedAt,
        })
        .onConflictDoUpdate({
          target: [settings.studentId, settings.key],
          set: {
            valueJson: JSON.stringify(value),
            updatedAt,
          },
        });
    }
  });
};

export const clearSettingsByStudentId = async (studentId: string) => {
  await db.delete(settings).where(eq(settings.studentId, studentId));
};

export const clearSetting = async <K extends SettingsKey>(studentId: string, key: K) => {
  await db.delete(settings).where(and(eq(settings.studentId, studentId), eq(settings.key, key)));
};
