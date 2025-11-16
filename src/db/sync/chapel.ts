import { ChapelApplicationInterface, ChapelInformation, SemesterType } from '@rusaint/react-native';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { cache } from '@/db/schema/cache';
import { chapelAttendances, chapelGeneral } from '@/db/schema/chapel';

const RUSAINT_NO_CHAPEL =
  'RusaintError.General: Error from application: No chapel information provided';

export const syncChapelInformation = async (
  client: ChapelApplicationInterface,
  year: number,
  semester: SemesterType,
) => {
  try {
    const info: ChapelInformation = await client.information(year, semester);

    // Save general information
    await db
      .delete(chapelGeneral)
      .where(and(eq(chapelGeneral.year, year), eq(chapelGeneral.semester, semester)))
      .execute();
    await db
      .insert(chapelGeneral)
      .values({
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
    await db
      .delete(chapelAttendances)
      .where(and(eq(chapelAttendances.year, year), eq(chapelAttendances.semester, semester)))
      .execute();
    if (info.attendances.length > 0) {
      await db
        .insert(chapelAttendances)
        .values(
          info.attendances.map((attendance) => ({
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
  } catch (error) {
    if (error instanceof Error && error.message === RUSAINT_NO_CHAPEL) {
      console.warn("User requested chapel information, but couldn't fetch it:", error);
    } else {
      throw error;
    }
  }

  // Update cache
  const cacheKey = `chapel.information.${year}-${semester}`;
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
