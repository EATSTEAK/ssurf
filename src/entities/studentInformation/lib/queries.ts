import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import { studentInformationSync } from '@/entities/studentInformation/lib/sync';
import { useSync } from '@/shared/lib/useSync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export const useStudentInformation = () => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(studentInformationSync(studentId ?? ''));
  const studentNumber = parseInt(studentId ?? '0', 10);

  const { data, error, updatedAt } = useLiveQuery(
    db.query.studentInformation.findFirst({
      where: (studentInformation, { eq }) => eq(studentInformation.studentNumber, studentNumber),
    }),
    [studentNumber],
  );

  return {
    data: data ?? null,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    refresh: sync.refresh,
    updatedAt,
  };
};
