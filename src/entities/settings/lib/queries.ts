import { sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { SetStateAction, useCallback } from 'react';

import { db } from '@/db';
import { settings, SettingsKey, settingsSchema, SettingsValue } from '@/entities/settings/model';
import { setSetting } from '@/entities/settings/service';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

const parseSettingValue = <K extends SettingsKey>(key: K, valueJson: string): SettingsValue<K> => {
  try {
    return JSON.parse(valueJson) as SettingsValue<K>;
  } catch {
    return settingsSchema[key].defaultValue as SettingsValue<K>;
  }
};

export const useSetting = <K extends SettingsKey>(key: K) => {
  const { studentId } = useRusaintApplication();
  const defaultValue = settingsSchema[key].defaultValue;

  const { data, updatedAt } = useLiveQuery(
    studentId
      ? db.query.settings.findFirst({
          where: (setting, { and, eq }) =>
            and(eq(setting.studentId, studentId), eq(setting.key, key)),
        })
      : db
          .select()
          .from(settings)
          .where(sql`1 = 0`),
    [studentId ?? '', key],
  );

  const row = Array.isArray(data) ? data[0] : data;
  const value = row ? parseSettingValue(key, row.valueJson) : defaultValue;

  const setValue = useCallback(
    async (nextValue: SetStateAction<SettingsValue<K>>) => {
      if (!studentId) {
        return;
      }

      const resolvedValue =
        typeof nextValue === 'function'
          ? (nextValue as (prevState: SettingsValue<K>) => SettingsValue<K>)(value)
          : nextValue;

      await setSetting(studentId, key, resolvedValue);
    },
    [key, studentId, value],
  );

  return [value, setValue, updatedAt] as const;
};
