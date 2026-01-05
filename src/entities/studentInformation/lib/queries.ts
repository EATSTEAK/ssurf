import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncStudentInformation } from '@/entities/studentInformation/lib/sync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useStudentInformation = () => {
  const { isSyncing, sync } = useSyncStudentInformation();
  const { studentId } = useRusaintApplication();

  const studentNumber = parseInt(studentId ?? '0', 10);

  const { data, error, updatedAt } = useLiveQuery(
    db.query.studentInformation.findFirst({
      where: (studentInformation, { eq }) => eq(studentInformation.studentNumber, studentNumber),
    }),
    [studentNumber],
  );

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data: data ?? null, isSyncing, error, updatedAt };
};
