import type { SemesterType } from '@rusaint/react-native';

import { describe, expect, it } from 'vitest';

import { includeSeasonalSemesters } from './utils';

const semester = (year: number, value: number) => ({ year, semester: value as SemesterType });

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
