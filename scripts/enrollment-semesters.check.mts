import { deriveEnrollmentSemesters } from '../src/entities/studentInformation/lib/enrollmentSemesters.ts';

const records = [
  {
    studentId: 'student',
    sequence: 0,
    startDate: '2021.03.01',
    endDate: '2023.02.28',
    year: '2021학년도',
    term: '1학기',
    category: '재학',
    reason: '',
    processDate: '2021.02.15',
  },
  {
    studentId: 'student',
    sequence: 1,
    startDate: '2023.03.01',
    endDate: '2025.02.27',
    year: '2023학년도',
    term: '1학기(여름학기포함)',
    category: '휴학',
    reason: '휴학',
    processDate: '2023.01.07',
  },
  {
    studentId: 'student',
    sequence: 2,
    startDate: '2025.02.28',
    endDate: '2025.02.28',
    year: '2025학년도',
    term: '1학기',
    category: '재학',
    reason: '',
    processDate: '2025.01.08',
  },
  {
    studentId: 'student',
    sequence: 3,
    startDate: '2025.03.01',
    endDate: '2025.08.31',
    year: '2025학년도',
    term: '1학기(여름학기포함)',
    category: '휴학',
    reason: '휴학',
    processDate: '2025.02.17',
  },
  {
    studentId: 'student',
    sequence: 4,
    startDate: '2025.09.01',
    endDate: '9999.12.31',
    year: '2025학년도',
    term: '2학기',
    category: '재학',
    reason: '',
    processDate: '2025.07.01',
  },
];

const actual = deriveEnrollmentSemesters(records, { year: 2026, semester: 0 });
const expected = [
  { year: 2026, semester: 0 },
  { year: 2025, semester: 2 },
  { year: 2022, semester: 2 },
  { year: 2022, semester: 0 },
  { year: 2021, semester: 2 },
  { year: 2021, semester: 0 },
];

if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`Unexpected semesters: ${JSON.stringify(actual)}`);
}
