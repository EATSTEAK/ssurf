import { useMemo } from 'react';

import {
  useGraduationRequirements,
  useGraduationRequirementsGeneral,
  useGraduationStudent,
} from '@/entities/graduationRequirements/lib/queries';
import { graduationRequirementsSync } from '@/entities/graduationRequirements/lib/sync';
import { GraduationView } from '@/features/grades/model';
import { refresh as refreshSync } from '@/shared/lib/syncEngine';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

interface UseGraduationViewResult {
  data: GraduationView | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useGraduationView = (): UseGraduationViewResult => {
  const { studentId } = useRusaintApplication();
  const { data: requirements, error: requirementsError, isSyncing } = useGraduationRequirements();
  const { data: general, error: generalError } = useGraduationRequirementsGeneral();
  const { data: student, error: studentError } = useGraduationStudent();

  const data = useMemo<GraduationView | null>(() => {
    if (!requirements || !general || !student) {
      return null;
    }

    return { general, requirements, student };
  }, [general, requirements, student]);

  const refresh = async () => {
    if (studentId) {
      await refreshSync(graduationRequirementsSync(studentId, true));
    }
  };

  return {
    data,
    error: requirementsError ?? generalError ?? studentError ?? null,
    isLoading: isSyncing,
    refresh,
  };
};
