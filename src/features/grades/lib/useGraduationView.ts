import { useMemo } from 'react';

import {
  useGraduationRequirements,
  useGraduationRequirementsGeneral,
  useGraduationStudent,
} from '@/entities/graduationRequirements/lib/queries';
import { useSyncGraduationRequirements } from '@/entities/graduationRequirements/lib/sync';
import { GraduationView } from '@/features/grades/model';

interface UseGraduationViewResult {
  data: GraduationView | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useGraduationView = (): UseGraduationViewResult => {
  const {
    sync: syncRequirements,
    isSyncing,
    error: requirementsError,
  } = useSyncGraduationRequirements();

  const { data: requirements } = useGraduationRequirements();
  const { data: general } = useGraduationRequirementsGeneral();
  const { data: student } = useGraduationStudent();

  const isLoading = isSyncing;

  const error = requirementsError || null;

  const data = useMemo<GraduationView | null>(() => {
    if (!requirements || !general || !student) {
      return null;
    }

    return {
      general,
      requirements,
      student,
    };
  }, [general, requirements, student]);

  const refresh = async () => {
    await syncRequirements([], { force: true });
  };

  return {
    data,
    isLoading,
    error,
    refresh,
  };
};
