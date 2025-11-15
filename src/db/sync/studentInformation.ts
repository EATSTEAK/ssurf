import { StudentInformation, StudentInformationApplicationInterface } from '@rusaint/react-native';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { cache } from '@/db/schema/cache';
import { studentInformation } from '@/db/schema/studentInformation';

export const syncStudentInformation = async (client: StudentInformationApplicationInterface) => {
  const info: StudentInformation = await client.general();

  // Save student information
  await db
    .delete(studentInformation)
    .where(eq(studentInformation.studentNumber, info.studentNumber))
    .execute();
  await db
    .insert(studentInformation)
    .values({
      applyYear: info.applyYear,
      studentNumber: info.studentNumber,
      name: info.name,
      rrn: info.rrn,
      college: info.collage,
      department: info.department,
      major: info.major ?? null,
      division: info.division ?? null,
      grade: info.grade,
      term: info.term,
      image: info.image,
      alias: info.alias ?? null,
      kanjiName: info.kanjiName ?? null,
      email: info.email ?? null,
      telNumber: info.telNumber ?? null,
      mobileNumber: info.mobileNumber ?? null,
      postCode: info.postCode ?? null,
      address: info.address ?? null,
      specificAddress: info.specificAddress ?? null,
      isTransferStudent: info.isTransferStudent ? 1 : 0,
      applyDate: info.applyDate,
      appliedCollege: info.appliedCollage,
      appliedDepartment: info.appliedDepartment,
      pluralMajor: info.pluralMajor ?? null,
      subMajor: info.subMajor ?? null,
      connectedMajor: info.connectedMajor ?? null,
      abeek: info.abeek ?? null,
    })
    .execute();

  // Update cache
  const cacheKey = `student-information.general.${info.studentNumber}`;
  await db
    .insert(cache)
    .values({
      key: cacheKey,
      updatedAt: Date.now(),
    })
    .onConflictDoUpdate({
      target: cache.key,
      set: {
        updatedAt: Date.now(),
      },
    })
    .execute();
};
