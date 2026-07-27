import { SemesterType } from '@rusaint/react-native';

import { syncChapelInformation } from '@/entities/chapel/service';
import { applications } from '@/shared/lib/applications';
import { SyncRequest } from '@/shared/lib/syncEngine';

export const chapelSync = (
  studentId: string,
  year: number,
  semester: SemesterType,
): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, `chapel.information.${year}-${semester}`],
    run: async () => {
      const { client } = await applications.get('chapel', studentId, generation);
      await syncChapelInformation(client, studentId, year, semester);
    },
  };
};
