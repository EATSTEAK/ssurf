import { ChapelApplicationInterface, ChapelInformation, SemesterType } from '@rusaint/react-native';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { chapelAttendances, chapelGeneral } from '@/entities/chapel/model';
import { cache } from '@/shared/model/schema/cache';

export const syncChapelInformation = async (
  client: ChapelApplicationInterface,
  studentId: string,
  year: number,
  semester: SemesterType,
) => {
  await client.lookup();
  const info: ChapelInformation = await client.information(year, semester);

  // 트랜잭션으로 아토믹하게 처리
  await db.transaction(async (tx) => {
    // Save general information
    await tx
      .delete(chapelGeneral)
      .where(
        and(
          eq(chapelGeneral.studentId, studentId),
          eq(chapelGeneral.year, year),
          eq(chapelGeneral.semester, semester),
        ),
      )
      .execute();
    await tx
      .insert(chapelGeneral)
      .values({
        studentId,
        year: info.year,
        semester: info.semester,
        division: info.generalInformation.division,
        time: info.generalInformation.chapelTime,
        room: info.generalInformation.chapelRoom,
        floor: info.generalInformation.floorLevel,
        seat: info.generalInformation.seatNumber,
        absenceTime: info.generalInformation.absenceTime,
        result: info.generalInformation.result,
        note: info.generalInformation.note,
      })
      .execute();

    // Save attendance information
    await tx
      .delete(chapelAttendances)
      .where(
        and(
          eq(chapelAttendances.studentId, studentId),
          eq(chapelAttendances.year, year),
          eq(chapelAttendances.semester, semester),
        ),
      )
      .execute();
    if (info.attendances.length > 0) {
      await tx
        .insert(chapelAttendances)
        .values(
          info.attendances.map((attendance) => ({
            studentId,
            year: info.year,
            semester: info.semester,
            date: attendance.classDate,
            division: attendance.division,
            category: attendance.category,
            instructor: attendance.instructor,
            instructorDepartment: attendance.instructorDepartment,
            title: attendance.title,
            attendance: attendance.attendance,
            result: attendance.result,
            note: attendance.note,
          })),
        )
        .execute();
    }

    // Update cache
    const cacheKey = `chapel.information.${year}-${semester}`;
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
