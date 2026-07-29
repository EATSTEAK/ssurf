import type { StudentAcademicRecordEntity } from '@/entities/studentInformation/model';
import type { SemesterType, YearSemester } from '@rusaint/react-native';

const regularSemesterStarts = [
  { monthDay: 901, semester: 2 as SemesterType },
  { monthDay: 301, semester: 0 as SemesterType },
] as const;

const toDateKey = (value: string) => {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value.trim());
  return match ? Number(`${match[1]}${match[2]}${match[3]}`) : null;
};

export const deriveEnrollmentSemesters = (
  records: readonly StudentAcademicRecordEntity[],
  currentSemester: YearSemester,
): YearSemester[] => {
  const periods = records.flatMap((record) => {
    const startDate = toDateKey(record.startDate);
    const endDate = toDateKey(record.endDate);
    if (startDate == null || endDate == null || startDate > endDate) {
      return [];
    }

    return [
      {
        ...record,
        startDate,
        endDate,
        processDate: toDateKey(record.processDate) ?? 0,
      },
    ];
  });

  if (periods.length === 0) {
    return [];
  }

  const firstYear = Math.floor(Math.min(...periods.map(({ startDate }) => startDate)) / 10000);
  const semesters: YearSemester[] = [];

  for (let year = currentSemester.year; year >= firstYear; year--) {
    for (const { monthDay, semester } of regularSemesterStarts) {
      if (year === currentSemester.year && semester > currentSemester.semester) {
        continue;
      }

      const semesterStart = year * 10000 + monthDay;
      const status = periods
        .filter(({ startDate, endDate }) => startDate <= semesterStart && semesterStart <= endDate)
        .sort((a, b) => b.processDate - a.processDate || b.sequence - a.sequence)[0];

      if (status?.category.trim() === '재학') {
        semesters.push({ year, semester });
      }
    }
  }

  return semesters;
};
