import { syncScholarships } from '@/entities/scholarships/service';
import { applications } from '@/shared/lib/applications';
import { SyncRequest } from '@/shared/lib/syncEngine';

export const scholarshipsSync = (studentId: string): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, 'scholarships'],
    run: async () => {
      const client = await applications.get('scholarships', studentId, generation);
      await syncScholarships(client, studentId);
    },
  };
};
