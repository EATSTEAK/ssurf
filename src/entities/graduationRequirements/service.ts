import {
  GraduationRequirements,
  GraduationRequirementsApplicationInterface,
  GraduationStudent,
} from '@rusaint/react-native';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import {
  graduationRequirements,
  graduationRequirementsGeneral,
  graduationStudent,
} from '@/entities/graduationRequirements/model';
import { cache } from '@/shared/model/schema/cache';

export const syncGraduationRequirementsInformation = async (
  client: GraduationRequirementsApplicationInterface,
  studentId: string,
  withReload: boolean = false,
) => {
  if (withReload) {
    // NOTE: Reload entire page to retrieve the latest data
    await client.reload();
  }
  const studentData: GraduationStudent = await client.studentInfo();
  const requirementsData: GraduationRequirements = await client.requirements();

  // 트랜잭션으로 아토믹하게 처리
  await db.transaction(async (tx) => {
    // Save general information
    await tx
      .delete(graduationRequirementsGeneral)
      .where(eq(graduationRequirementsGeneral.studentId, studentId))
      .execute();
    await tx
      .insert(graduationRequirementsGeneral)
      .values({
        studentId,
        isGraduatable: requirementsData.isGraduatable ? 1 : 0,
        updatedAt: Date.now(),
      })
      .execute();

    // Save requirements information
    await tx
      .delete(graduationRequirements)
      .where(eq(graduationRequirements.studentId, studentId))
      .execute();
    const requirementsEntries = Array.from(requirementsData.requirements.entries());
    if (requirementsEntries.length > 0) {
      await tx
        .insert(graduationRequirements)
        .values(
          requirementsEntries.map(([name, req]) => ({
            studentId,
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
    await tx.delete(graduationStudent).where(eq(graduationStudent.studentId, studentId)).execute();
    await tx
      .insert(graduationStudent)
      .values({
        studentId,
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
    await tx
      .insert(cache)
      .values({
        studentId,
        key: cacheKey,
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: [cache.studentId, cache.key],
        set: {
          updatedAt: Date.now(),
        },
      })
      .execute();
  });
};
