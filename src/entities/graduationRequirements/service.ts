import {
  GraduationRequirements,
  GraduationRequirementsApplicationInterface,
  GraduationStudent,
} from '@rusaint/react-native';

import { db } from '@/db';
import {
  graduationRequirements,
  graduationRequirementsGeneral,
  graduationStudent,
} from '@/entities/graduationRequirements/model';
import { cache } from '@/shared/model/schema/cache';

export const syncGraduationRequirementsInformation = async (
  client: GraduationRequirementsApplicationInterface,
) => {
  const studentData: GraduationStudent = await client.studentInfo();
  const requirementsData: GraduationRequirements = await client.requirements();

  // Save general information
  await db.delete(graduationRequirementsGeneral).execute();
  await db
    .insert(graduationRequirementsGeneral)
    .values({
      isGraduatable: requirementsData.isGraduatable ? 1 : 0,
      updatedAt: Date.now(),
    })
    .execute();

  // Save requirements information
  await db.delete(graduationRequirements).execute();
  const requirementsEntries = Array.from(requirementsData.requirements.entries());
  if (requirementsEntries.length > 0) {
    await db
      .insert(graduationRequirements)
      .values(
        requirementsEntries.map(([name, req]) => ({
          name,
          requirement: req.requirement ?? null,
          calculation: req.calculation ?? null,
          difference: req.difference ?? null,
          result: req.result ? 1 : 0,
          category: req.category,
          lectures: JSON.stringify(req.lectures),
        })),
      )
      .execute();
  }

  // Save student information
  await db.delete(graduationStudent).execute();
  await db
    .insert(graduationStudent)
    .values({
      number: studentData.number,
      name: studentData.name,
      grade: studentData.grade,
      semester: studentData.semester,
      status: studentData.status,
      applyYear: studentData.applyYear,
      applyType: studentData.applyType,
      department: studentData.department,
      majors: JSON.stringify(studentData.majors),
      auditDate: studentData.auditDate,
      graduationPoints: studentData.graduationPoints,
      completedPoints: studentData.completedPoints,
    })
    .execute();

  // Update cache
  const cacheKey = 'graduation.requirements';
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
