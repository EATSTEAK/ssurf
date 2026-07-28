import type { ChapelAttendanceEntity, ChapelGeneralEntity } from '@/entities/chapel/model';
import type { ClassGradeEntity, SemesterGradeEntity } from '@/entities/grades/model';
import type {
  ChapelInformation,
  ClassGrade,
  SemesterGrade,
  YearSemester,
} from '@rusaint/react-native';

type CourseGradeSnapshotItem = {
  className: string;
  code: string;
  detail: [string, number][] | null;
  gradePoints: number;
  professor: string;
  rank: string;
  scoreType: string;
  scoreValue: null | number;
};

export type CourseGradeSnapshot = {
  classes: CourseGradeSnapshotItem[];
  semester: number;
  year: number;
};

export type SemesterGradeSnapshot = Array<{
  academicProbation: boolean;
  arithmeticMean: number;
  attemptedCredits: number;
  consult: boolean;
  earnedCredits: number;
  flunked: boolean;
  generalRankFirst: null | number;
  generalRankSecond: null | number;
  gradePointsAverage: number;
  gradePointsSum: number;
  pfEarnedCredits: number;
  semester: number;
  semesterRankFirst: null | number;
  semesterRankSecond: null | number;
  year: number;
}>;

export type ChapelSnapshot = {
  attendances: Array<{
    attendance: null | string;
    category: null | string;
    date: string;
    division: null | number;
    instructor: null | string;
    instructorDepartment: null | string;
    note: null | string;
    result: null | string;
    title: null | string;
  }>;
  general: null | {
    absenceTime: null | number;
    division: null | number;
    floor: null | number;
    note: null | string;
    result: null | string;
    room: null | string;
    seat: null | string;
    time: null | string;
  };
  semester: number;
  year: number;
};

const compareStrings = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0);

const normalizeDetail = (detail: Map<string, number> | undefined) =>
  detail ? [...detail].sort(([left], [right]) => compareStrings(left, right)) : null;

const parseDetail = (detailJson: null | string) => {
  if (detailJson === null) {
    return null;
  }

  try {
    const detail = JSON.parse(detailJson) as Record<string, number>;
    return Object.entries(detail).sort(([left], [right]) => compareStrings(left, right));
  } catch {
    return null;
  }
};

const sortCourseGrades = (grades: CourseGradeSnapshotItem[]) =>
  grades.sort((left, right) =>
    compareStrings(`${left.code}\u0000${left.className}`, `${right.code}\u0000${right.className}`),
  );

export const createRemoteCourseGradeSnapshot = (
  selectedSemester: YearSemester,
  grades: readonly ClassGrade[],
): CourseGradeSnapshot => ({
  classes: sortCourseGrades(
    grades.map((grade) => ({
      className: grade.className,
      code: grade.code,
      detail: normalizeDetail(grade.detail),
      gradePoints: grade.gradePoints,
      professor: grade.professor,
      rank: grade.rank,
      scoreType: grade.score.tag,
      scoreValue: grade.score.tag === 'Score' ? grade.score.inner[0] : null,
    })),
  ),
  semester: selectedSemester.semester,
  year: selectedSemester.year,
});

export const createStoredCourseGradeSnapshot = (
  selectedSemester: YearSemester,
  grades: readonly ClassGradeEntity[],
): CourseGradeSnapshot => ({
  classes: sortCourseGrades(
    grades.map((grade) => ({
      className: grade.className,
      code: grade.code,
      detail: parseDetail(grade.detailJson),
      gradePoints: grade.gradePoints,
      professor: grade.professor,
      rank: grade.rank,
      scoreType: grade.scoreType,
      scoreValue: grade.scoreValue,
    })),
  ),
  semester: selectedSemester.semester,
  year: selectedSemester.year,
});

const sortSemesterGrades = (grades: SemesterGradeSnapshot) =>
  grades.sort((left, right) => right.year - left.year || right.semester - left.semester);

export const createRemoteSemesterGradeSnapshot = (
  grades: readonly SemesterGrade[],
): SemesterGradeSnapshot =>
  sortSemesterGrades(
    grades.map((grade) => ({
      academicProbation: grade.academicProbation,
      arithmeticMean: grade.arithmeticMean,
      attemptedCredits: grade.attemptedCredits,
      consult: grade.consult,
      earnedCredits: grade.earnedCredits,
      flunked: grade.flunked,
      generalRankFirst: grade.generalRank?.first ?? null,
      generalRankSecond: grade.generalRank?.second ?? null,
      gradePointsAverage: grade.gradePointsAverage,
      gradePointsSum: grade.gradePointsSum,
      pfEarnedCredits: grade.pfEarnedCredits,
      semester: grade.semester,
      semesterRankFirst: grade.semesterRank?.first ?? null,
      semesterRankSecond: grade.semesterRank?.second ?? null,
      year: grade.year,
    })),
  );

export const createStoredSemesterGradeSnapshot = (
  grades: readonly SemesterGradeEntity[],
): SemesterGradeSnapshot =>
  sortSemesterGrades(
    grades.map((grade) => ({
      academicProbation: grade.academicProbation !== 0,
      arithmeticMean: grade.arithmeticMean,
      attemptedCredits: grade.attemptedCredits,
      consult: grade.consult !== 0,
      earnedCredits: grade.earnedCredits,
      flunked: grade.flunked !== 0,
      generalRankFirst: grade.generalRankFirst,
      generalRankSecond: grade.generalRankSecond,
      gradePointsAverage: grade.gradePointsAverage,
      gradePointsSum: grade.gradePointsSum,
      pfEarnedCredits: grade.pfEarnedCredits,
      semester: grade.semester,
      semesterRankFirst: grade.semesterRankFirst,
      semesterRankSecond: grade.semesterRankSecond,
      year: grade.year,
    })),
  );

const sortAttendances = (attendances: ChapelSnapshot['attendances']) =>
  attendances.sort((left, right) => compareStrings(left.date, right.date));

export const createRemoteChapelSnapshot = (information: ChapelInformation): ChapelSnapshot => ({
  attendances: sortAttendances(
    information.attendances.map((attendance) => ({
      attendance: attendance.attendance,
      category: attendance.category,
      date: attendance.classDate,
      division: attendance.division,
      instructor: attendance.instructor,
      instructorDepartment: attendance.instructorDepartment,
      note: attendance.note,
      result: attendance.result,
      title: attendance.title,
    })),
  ),
  general: {
    absenceTime: information.generalInformation.absenceTime,
    division: information.generalInformation.division,
    floor: information.generalInformation.floorLevel,
    note: information.generalInformation.note,
    result: information.generalInformation.result,
    room: information.generalInformation.chapelRoom,
    seat: information.generalInformation.seatNumber,
    time: information.generalInformation.chapelTime,
  },
  semester: information.semester,
  year: information.year,
});

export const createStoredChapelSnapshot = (
  selectedSemester: YearSemester,
  general: ChapelGeneralEntity | null,
  attendances: readonly ChapelAttendanceEntity[],
): ChapelSnapshot => ({
  attendances: sortAttendances(
    attendances.map((attendance) => ({
      attendance: attendance.attendance,
      category: attendance.category,
      date: attendance.date,
      division: attendance.division,
      instructor: attendance.instructor,
      instructorDepartment: attendance.instructorDepartment,
      note: attendance.note,
      result: attendance.result,
      title: attendance.title,
    })),
  ),
  general: general
    ? {
        absenceTime: general.absenceTime,
        division: general.division,
        floor: general.floor,
        note: general.note,
        result: general.result,
        room: general.room,
        seat: general.seat,
        time: general.time,
      }
    : null,
  semester: selectedSemester.semester,
  year: selectedSemester.year,
});

export const fingerprintSnapshot = (snapshot: unknown) => JSON.stringify(snapshot);
