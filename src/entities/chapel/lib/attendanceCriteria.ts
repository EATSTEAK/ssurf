import { SemesterType, type YearSemester } from '@rusaint/react-native';

import { getPreviousSemester } from '@/shared/lib/semester';

export const DEFAULT_CHAPEL_ATTENDANCE_RATIO = 2 / 3;

export interface ChapelAttendancePolicy {
  ratio: number;
  startSemester: YearSemester;
}

const semesterOrder = [
  SemesterType.One,
  SemesterType.Summer,
  SemesterType.Two,
  SemesterType.Winter,
] as const;

const getSemesterPolicyKey = ({ year, semester }: YearSemester) => `${year}-${semester}`;

const isSameOrAfterSemester = (lhs: YearSemester, rhs: YearSemester) => {
  if (lhs.year !== rhs.year) {
    return lhs.year > rhs.year;
  }

  return semesterOrder.indexOf(lhs.semester) >= semesterOrder.indexOf(rhs.semester);
};

export const CHAPEL_ATTENDANCE_POLICIES: ChapelAttendancePolicy[] = [
  { startSemester: { year: 2026, semester: SemesterType.One }, ratio: 0.8 },
];

const chapelAttendanceRatioByStartSemester = new Map(
  CHAPEL_ATTENDANCE_POLICIES.map(({ startSemester, ratio }) => [
    getSemesterPolicyKey(startSemester),
    ratio,
  ]),
);

export const getChapelAttendanceRatio = (year: number, semester: SemesterType) => {
  if (CHAPEL_ATTENDANCE_POLICIES.length === 0) {
    return DEFAULT_CHAPEL_ATTENDANCE_RATIO;
  }

  const earliestPolicy = CHAPEL_ATTENDANCE_POLICIES.reduce((earliest, policy) => {
    return isSameOrAfterSemester(earliest.startSemester, policy.startSemester) ? policy : earliest;
  });

  let currentSemester: YearSemester = { year, semester };

  while (isSameOrAfterSemester(currentSemester, earliestPolicy.startSemester)) {
    const ratio = chapelAttendanceRatioByStartSemester.get(getSemesterPolicyKey(currentSemester));

    if (ratio !== undefined) {
      return ratio;
    }

    currentSemester = getPreviousSemester(currentSemester);
  }

  return DEFAULT_CHAPEL_ATTENDANCE_RATIO;
};

export const calculateRequiredAttendances = (
  totalAttendances: number,
  year: number,
  semester: SemesterType,
) => {
  return Math.ceil(totalAttendances * getChapelAttendanceRatio(year, semester));
};
