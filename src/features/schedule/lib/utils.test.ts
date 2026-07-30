import type { SemesterType } from '@rusaint/react-native';

import { describe, expect, it } from 'vitest';

import { buildScheduleSemesters } from './utils';

const semester = (year: number, value: number) => ({ year, semester: value as SemesterType });

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
