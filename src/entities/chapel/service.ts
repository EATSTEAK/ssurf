import { ChapelApplicationInterface, ChapelInformation, SemesterType } from '@rusaint/react-native';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { chapelAttendances, chapelGeneral } from '@/entities/chapel/model';
import { cache } from '@/shared/model/schema/cache';

export const syncChapelInformation = async (
  client: ChapelApplicationInterface,
  year: number,
  semester: SemesterType,
) => {
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
