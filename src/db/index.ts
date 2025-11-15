import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as cacheSchemas from '@/db/schema/cache';
import * as chapelSchemas from '@/db/schema/chapel';
import * as gradesSchemas from '@/db/schema/grades';

const expoDb = openDatabaseSync('db.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema: { ...chapelSchemas, ...cacheSchemas, ...gradesSchemas } });
