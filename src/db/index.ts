import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as cacheSchemas from '@/db/schema/cache';
import * as chapelSchemas from '@/db/schema/chapel';
import * as gradesSchemas from '@/db/schema/grades';
import * as graduationRequirementsSchemas from '@/db/schema/graduationRequirements';
import * as scholarshipsSchemas from '@/db/schema/scholarships';
import * as studentInformationSchemas from '@/db/schema/studentInformation';

const schema = {
  ...chapelSchemas,
  ...cacheSchemas,
  ...gradesSchemas,
  ...graduationRequirementsSchemas,
  ...scholarshipsSchemas,
  ...studentInformationSchemas,
};

export const expoDb = openDatabaseSync('db.db', { enableChangeListener: true });

export const db = drizzle(expoDb, {
  schema,
});

/**
 * 로그아웃 시 모든 DB 데이터를 삭제합니다.
 */
export const clearAllData = async () => {
  const promises = Object.values(schema).map((table) => db.delete(table));
  await Promise.all(promises);
};
