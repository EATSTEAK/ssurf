import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import { deriveEnrollmentSemesters } from '@/entities/studentInformation/lib/enrollmentSemesters';
import {
  studentAcademicRecordsSync,
  studentInformationSync,
} from '@/entities/studentInformation/lib/sync';
import { getEstimatedCurrentSemester } from '@/shared/lib/semester';
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

export const useStudentAcademicRecords = () => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(studentAcademicRecordsSync(studentId ?? ''));
  const { data, error, updatedAt } = useLiveQuery(
    db.query.studentAcademicRecords.findMany({
      where: (records, { eq }) => eq(records.studentId, studentId ?? ''),
      orderBy: (records, { asc }) => [asc(records.sequence)],
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

export const useEnrollmentSemesters = () => {
  const state = useStudentAcademicRecords();

  return {
    ...state,
    data: deriveEnrollmentSemesters(state.data, getEstimatedCurrentSemester(true)),
  };
};
