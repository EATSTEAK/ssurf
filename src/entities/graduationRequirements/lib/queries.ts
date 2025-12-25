import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncGraduationRequirements } from '@/entities/graduationRequirements/lib/sync';

export const useGraduationRequirements = () => {
  const { isSyncing, sync } = useSyncGraduationRequirements();

  const { data, error, updatedAt } = useLiveQuery(db.query.graduationRequirements.findMany());

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data, isSyncing, error, updatedAt };
};

export const useGraduationRequirementsGeneral = () => {
  const { isSyncing, sync } = useSyncGraduationRequirements();

  const { data, error, updatedAt } = useLiveQuery(
    db.query.graduationRequirementsGeneral.findFirst(),
  );

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data: data ?? null, isSyncing, error, updatedAt };
};

export const useGraduationStudent = () => {
  const { isSyncing, sync } = useSyncGraduationRequirements();

  const { data, error, updatedAt } = useLiveQuery(db.query.graduationStudent.findFirst());

  useAsyncEffect(async () => {
    await sync([], { force: false });
  }, []);

  return { data: data ?? null, isSyncing, error, updatedAt };
};
