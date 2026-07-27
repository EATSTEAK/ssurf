import { syncGraduationRequirementsInformation } from '@/entities/graduationRequirements/service';
import { applications } from '@/shared/lib/applications';
import { SyncRequest } from '@/shared/lib/syncEngine';

export const graduationRequirementsSync = (studentId: string, withReload = false): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, 'graduation.requirements'],
    run: async () => {
      const client = await applications.get('graduationRequirements', studentId, generation);
      await syncGraduationRequirementsInformation(client, studentId, withReload);
    },
  };
};
