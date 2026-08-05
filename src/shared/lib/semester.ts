import { SemesterType, YearSemester } from '@rusaint/react-native';

export const getEstimatedCurrentSemester = (excludeSeasonal: boolean = false): YearSemester => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() is zero-based
  if (month < 3) {
    if (excludeSeasonal) {
      return { year: year - 1, semester: SemesterType.Two };
    }
    return { year, semester: SemesterType.Winter };
  }
  if (month < 7) {
    return { year, semester: SemesterType.One };
  }
  if (month < 9) {
    if (excludeSeasonal) {
      return { year, semester: SemesterType.One };
    }
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

export const USAINT_COURSE_FIRST_YEAR = 1954;

const semesterSlugParts: Record<SemesterType, string> = {
  [SemesterType.One]: '1',
  [SemesterType.Summer]: 'summer',
  [SemesterType.Two]: '2',
  [SemesterType.Winter]: 'winter',
};

export const semesterToSlug = ({ year, semester }: YearSemester): string =>
  `${year}-${semesterSlugParts[semester]}`;

export const parseSemesterSlug = (value: string): null | YearSemester => {
  const match = value.match(/^(\d{4})-(1|summer|2|winter)$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  if (year < USAINT_COURSE_FIRST_YEAR || year > 2100) {
    return null;
  }

  const semesters: Record<string, SemesterType> = {
    '1': SemesterType.One,
    summer: SemesterType.Summer,
    '2': SemesterType.Two,
    winter: SemesterType.Winter,
  };

  return { year, semester: semesters[match[2]] };
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

/**
 * 이전 학기를 계산
 * @param semester 기준 학기
 * @returns 이전 학기
 */
export const getPreviousSemester = (semester: YearSemester): YearSemester => {
  const semesterOrder = [
    SemesterType.One,
    SemesterType.Summer,
    SemesterType.Two,
    SemesterType.Winter,
  ];

  const currentIndex = semesterOrder.indexOf(semester.semester);
  if (currentIndex > 0) {
    return {
      year: semester.year,
      semester: semesterOrder[currentIndex - 1],
    };
  }
  return {
    year: semester.year - 1,
    semester: SemesterType.Winter,
  };
};

/**
 * 기준 학기로부터 최근 N개의 학기를 생성
 * @param baseSemester 기준 학기
 * @param count 생성할 학기 개수 (기준 학기 포함)
 * @returns 최근 학기들 (내림차순)
 */
export const getRecentSemesters = (baseSemester: YearSemester, count: number): YearSemester[] => {
  const semesters: YearSemester[] = [baseSemester];
  let current = baseSemester;

  for (let i = 1; i < count; i++) {
    current = getPreviousSemester(current);
    semesters.push(current);
  }

  return semesters;
};
