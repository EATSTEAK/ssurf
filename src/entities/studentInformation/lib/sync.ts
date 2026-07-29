import {
  syncStudentAcademicRecords,
  syncStudentInformation,
} from '@/entities/studentInformation/service';
import { applications } from '@/shared/lib/applications';
import { SyncRequest } from '@/shared/lib/syncEngine';

export const studentInformationSync = (studentId: string): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, 'student-information.general'],
    run: async () => {
      const client = await applications.get('studentInformation', studentId, generation);
      await syncStudentInformation(client);
    },
  };
};

export const studentAcademicRecordsSync = (studentId: string): SyncRequest => {
  const generation = applications.getGeneration();

  return {
    key: [studentId, 'student-information.academic-records'],
    run: async () => {
      const client = await applications.get('studentInformation', studentId, generation);
      await syncStudentAcademicRecords(client, studentId);
    },
  };
};
