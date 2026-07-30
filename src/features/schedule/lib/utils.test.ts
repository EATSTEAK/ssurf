import type { SemesterType } from '@rusaint/react-native';

import { describe, expect, it } from 'vitest';

import { includeSeasonalSemesters, isScheduleActive } from './utils';

const semester = (year: number, value: number) => ({ year, semester: value as SemesterType });

describe('isScheduleActive', () => {
  const mondayCourse = { weekday: 0, startTime: 9 * 60, endTime: 10 * 60 };

  it('includes the start and excludes the end of the current course', () => {
    expect(isScheduleActive(mondayCourse, new Date(2026, 6, 27, 9, 0))).toBe(true);
    expect(isScheduleActive(mondayCourse, new Date(2026, 6, 27, 10, 0))).toBe(false);
    expect(isScheduleActive(mondayCourse, new Date(2026, 6, 28, 9, 30))).toBe(false);
  });
});

describe('includeSeasonalSemesters', () => {
  it('adds summer and winter beside their enrolled regular semesters', () => {
    expect(
      includeSeasonalSemesters([semester(2026, 0), semester(2025, 2)], semester(2026, 1)),
    ).toEqual([semester(2026, 1), semester(2026, 0), semester(2025, 3), semester(2025, 2)]);
  });

  it('does not add a future seasonal semester', () => {
    expect(includeSeasonalSemesters([semester(2026, 0)], semester(2026, 0))).toEqual([
      semester(2026, 0),
    ]);
  });
});
