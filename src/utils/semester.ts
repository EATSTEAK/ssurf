import { SemesterType, YearSemester } from '@rusaint/react-native';

export const getEstimatedCurrentSemester = (): YearSemester => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() is zero-based
  if (month < 3) {
    return { year, semester: SemesterType.Winter };
  }
  if (month < 7) {
    return { year, semester: SemesterType.One };
  }
  if (month < 9) {
    return { year, semester: SemesterType.Summer };
  }
  return { year, semester: SemesterType.Two };
};

const semesterNames: Record<SemesterType, string> = {
  [SemesterType.Winter]: '겨울',
  [SemesterType.One]: '1',
  [SemesterType.Summer]: '여름',
  [SemesterType.Two]: '2',
};

export const semesterTypeToString = (semester: SemesterType): string => {
  return `${semesterNames[semester]}학기`;
};

export const semesterToString = (semester: YearSemester): string => {
  return `${semester.year}-${semesterTypeToString(semester.semester)}`;
};

export const constructSemesters = (
  startYear: number,
  endYear: number,
  includedSemesters: SemesterType[] = [
    SemesterType.Winter,
    SemesterType.One,
    SemesterType.Summer,
    SemesterType.Two,
  ],
): YearSemester[] => {
  const semesters: YearSemester[] = [];
  for (let year = endYear; year >= startYear; year--) {
    for (const semester of includedSemesters) {
      semesters.push({ year, semester });
    }
  }
  return semesters;
};
