import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncScholarships } from '@/entities/scholarships/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useScholarships = () => {
  const { isSyncing, sync } = useSyncScholarships();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.scholarships.findMany({
      where: (scholarships, { eq }) => eq(scholarships.studentId, studentId ?? ''),
    }),
    [studentId],
  );

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data, isSyncing, error, updatedAt };
};
