import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncGraduationRequirements } from '@/entities/graduationRequirements/lib/sync';
import {
  GraduationRequirementEntity,
  GraduationRequirementsGeneralEntity,
} from '@/entities/graduationRequirements/model';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

export interface UseGraduationRequirementsReturn {
  data: GraduationRequirementEntity[] | null;
  error: Error | undefined;
  isSyncing: boolean;
  updatedAt: Date | undefined;
}

export const useGraduationRequirements = (): UseGraduationRequirementsReturn => {
  const { isSyncing, sync } = useSyncGraduationRequirements();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.graduationRequirements.findMany({
      where: (graduationRequirements, { eq }) =>
        eq(graduationRequirements.studentId, studentId ?? ''),
    }),
    [studentId],
  );

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data, isSyncing, error, updatedAt };
};

export interface UseGraduationRequirementsGeneralReturn {
  data: GraduationRequirementsGeneralEntity | null;
  error: Error | undefined;
  isSyncing: boolean;
  updatedAt: Date | undefined;
}

export const useGraduationRequirementsGeneral = (): UseGraduationRequirementsGeneralReturn => {
  const { isSyncing, sync } = useSyncGraduationRequirements();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.graduationRequirementsGeneral.findFirst({
      where: (graduationRequirementsGeneral, { eq }) =>
        eq(graduationRequirementsGeneral.studentId, studentId ?? ''),
    }),
    [studentId],
  );

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data: data ?? null, isSyncing, error, updatedAt };
};

export const useGraduationStudent = () => {
  const { isSyncing, sync } = useSyncGraduationRequirements();
  const { studentId } = useRusaintApplication();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.graduationStudent.findFirst({
      where: (graduationStudent, { eq }) => eq(graduationStudent.studentId, studentId ?? ''),
    }),
    [studentId],
  );

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data: data ?? null, isSyncing, error, updatedAt };
};
