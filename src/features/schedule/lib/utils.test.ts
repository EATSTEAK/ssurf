import type { SemesterType } from '@rusaint/react-native';

import { describe, expect, it } from 'vitest';

import { buildScheduleSemesters, isScheduleActive } from './utils';

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
  it('keeps the saved selection and includes the U-Saint default', () => {
    expect(
      buildScheduleSemesters(
        semester(2026, 1),
        [semester(2026, 0), semester(2025, 2)],
        semester(2025, 3),
        semester(2026, 0),
      ),
    ).toEqual([semester(2026, 0), semester(2025, 3), semester(2026, 1), semester(2025, 2)]);
  });

  it('does not duplicate the estimated semester', () => {
    expect(buildScheduleSemesters(semester(2026, 0), [semester(2026, 0)], null, null)).toEqual([
      semester(2026, 0),
    ]);
  });
});
