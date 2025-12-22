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
 * @throws {Error} 데이터 삭제 중 오류가 발생한 경우
 */
export const clearAllData = async () => {
  const promises = Object.values(schema).map((table) => db.delete(table));
  const results = await Promise.allSettled(promises);

  const failures = results.filter((result) => result.status === 'rejected');
  if (failures.length > 0) {
    console.error('데이터 삭제 중 오류 발생:', failures);
    throw new Error(`${failures.length}개의 테이블 삭제 실패`);
  }
};
