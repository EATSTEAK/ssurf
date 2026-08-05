import type { SemesterType } from '@rusaint/react-native';

import { describe, expect, it } from 'vitest';

import { buildScheduleSemesters, findCourseMatch, isScheduleActive } from './utils';

const semester = (year: number, value: number) => ({ year, semester: value as SemesterType });

describe('isScheduleActive', () => {
  const mondayCourse = { weekday: 0, startTime: 9 * 60, endTime: 10 * 60 };

  it('includes the start and excludes the end of the current course', () => {
    expect(isScheduleActive(mondayCourse, new Date(2026, 6, 27, 9, 0))).toBe(true);
    expect(isScheduleActive(mondayCourse, new Date(2026, 6, 27, 10, 0))).toBe(false);
    expect(isScheduleActive(mondayCourse, new Date(2026, 6, 28, 9, 30))).toBe(false);
  });
});

describe('buildScheduleSemesters', () => {
  it('includes every candidate in reverse chronological order', () => {
    expect(
      buildScheduleSemesters(
        semester(2026, 1),
        [semester(2026, 0), semester(2025, 2)],
        semester(2025, 3),
        semester(2026, 0),
      ),
    ).toEqual([semester(2026, 1), semester(2026, 0), semester(2025, 3), semester(2025, 2)]);
  });

  it('does not duplicate the estimated semester', () => {
    expect(buildScheduleSemesters(semester(2026, 0), [semester(2026, 0)], null, null)).toEqual([
      semester(2026, 0),
    ]);
  });
});

describe('findCourseMatch', () => {
  const schedule = {
    name: '자료구조',
    professor: '홍길동',
    classroom: '정보과학관 101호',
    startTime: 9 * 60,
    endTime: 10 * 60 + 15,
  };
  const candidate = (professor: string, scheduleRoom: string) => ({
    lecture: { name: '자료구조', professor, scheduleRoom },
  });

  it('prefers the matching professor, classroom, and time', () => {
    const matching = candidate('홍길동', '월 09:00-10:15 (정보과학관 101호)');
    const other = candidate('김철수', '월 09:00-10:15 (정보과학관 201호)');

    expect(findCourseMatch(schedule, [other, matching])).toBe(matching);
  });

  it('returns no match when scores are tied', () => {
    const first = candidate('홍길동', '월 09:00-10:15 (정보과학관 101호)');
    const second = candidate('홍길동', '수 09:00-10:15 (정보과학관 101호)');

    expect(findCourseMatch(schedule, [first, second])).toBeUndefined();
  });

  it('returns no match for a different course', () => {
    const other = { lecture: { name: '운영체제', professor: '홍길동', scheduleRoom: '' } };

    expect(findCourseMatch(schedule, [other])).toBeUndefined();
  });
});
