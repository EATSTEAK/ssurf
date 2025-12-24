import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncGraduationRequirements } from '@/entities/graduationRequirements/lib/useSyncGraduationRequirements';
import {
  GraduationRequirementDto,
  GraduationRequirementsGeneralDto,
  GraduationStudentDto,
} from '@/entities/graduationRequirements/model/graduationRequirements';

export const useGraduationRequirementsGeneral = () => {
  const [data, setData] = useState<GraduationRequirementsGeneralDto | null>(null);
  const { isSyncing, sync } = useSyncGraduationRequirements();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.graduationRequirementsGeneral.findFirst();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};

export const useGraduationRequirements = () => {
  const [data, setData] = useState<GraduationRequirementDto[] | null>(null);
  const { isSyncing, sync } = useSyncGraduationRequirements();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.graduationRequirements.findMany();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};

export const useGraduationStudent = () => {
  const [data, setData] = useState<GraduationStudentDto | null>(null);
  const { isSyncing, sync } = useSyncGraduationRequirements();

  useAsyncEffect(async () => {
    await sync([], { force: false });
    const result = await db.query.graduationStudent.findFirst();
    setData(result || null);
  }, [isSyncing]);

  return { data, isSyncing };
};
