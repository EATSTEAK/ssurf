import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db';
import { graduationRequirementsSync } from '@/entities/graduationRequirements/lib/sync';
import {
  GraduationRequirementEntity,
  GraduationRequirementsGeneralEntity,
} from '@/entities/graduationRequirements/model';
import { useSync } from '@/shared/lib/useSync';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export interface UseGraduationRequirementsReturn {
  data: GraduationRequirementEntity[] | null;
  error: Error | undefined;
  isSyncing: boolean;
  refresh: () => Promise<unknown>;
  updatedAt: Date | undefined;
}

export const useGraduationRequirements = (): UseGraduationRequirementsReturn => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(graduationRequirementsSync(studentId ?? ''));

  const { data, error, updatedAt } = useLiveQuery(
    db.query.graduationRequirements.findMany({
      where: (graduationRequirements, { eq }) =>
        eq(graduationRequirements.studentId, studentId ?? ''),
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

export interface UseGraduationRequirementsGeneralReturn {
  data: GraduationRequirementsGeneralEntity | null;
  error: Error | undefined;
  isSyncing: boolean;
  updatedAt: Date | undefined;
}

export const useGraduationRequirementsGeneral = (): UseGraduationRequirementsGeneralReturn => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(graduationRequirementsSync(studentId ?? ''));

  const { data, error, updatedAt } = useLiveQuery(
    db.query.graduationRequirementsGeneral.findFirst({
      where: (graduationRequirementsGeneral, { eq }) =>
        eq(graduationRequirementsGeneral.studentId, studentId ?? ''),
    }),
    [studentId],
  );

  return {
    data: data ?? null,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    updatedAt,
  };
};

export const useGraduationStudent = () => {
  const { studentId } = useRusaintApplication();
  const sync = useSync(graduationRequirementsSync(studentId ?? ''));

  const { data, error, updatedAt } = useLiveQuery(
    db.query.graduationStudent.findFirst({
      where: (graduationStudent, { eq }) => eq(graduationStudent.studentId, studentId ?? ''),
    }),
    [studentId],
  );

  return {
    data: data ?? null,
    error: sync.error ?? error,
    isSyncing: sync.isSyncing,
    updatedAt,
  };
};
