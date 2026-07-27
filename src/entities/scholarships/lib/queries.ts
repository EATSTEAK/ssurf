import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import { scholarshipsSync } from '@/entities/scholarships/lib/sync';
import { useSync } from '@/shared/lib/useSync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useScholarships = () => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(scholarshipsSync(studentId ?? ''));

  const { data, error, updatedAt } = useLiveQuery(
    db.query.scholarships.findMany({
      where: (scholarships, { eq }) => eq(scholarships.studentId, studentId ?? ''),
    }),
    [studentId],
  );

  return {
    data,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};
