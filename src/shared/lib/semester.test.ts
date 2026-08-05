import { SemesterType } from '@rusaint/react-native';
import { describe, expect, it, vi } from 'vitest';

import { parseSemesterSlug, semesterToSlug } from './semester';

vi.mock('@rusaint/react-native', () => ({
  SemesterType: { One: 0, Summer: 1, Two: 2, Winter: 3 },
}));

describe('semester route slug', () => {
  it.each([
    [{ year: 1954, semester: SemesterType.One }, '1954-1'],
    [{ year: 2026, semester: SemesterType.One }, '2026-1'],
    [{ year: 2026, semester: SemesterType.Summer }, '2026-summer'],
    [{ year: 2026, semester: SemesterType.Two }, '2026-2'],
    [{ year: 2026, semester: SemesterType.Winter }, '2026-winter'],
  ])('round-trips %j', (semester, slug) => {
    expect(semesterToSlug(semester)).toBe(slug);
    expect(parseSemesterSlug(slug)).toEqual(semester);
  });

  it('rejects malformed and out-of-range slugs', () => {
    expect(parseSemesterSlug('2026-0')).toBeNull();
    expect(parseSemesterSlug('1953-1')).toBeNull();
    expect(parseSemesterSlug('2026-1-extra')).toBeNull();
  });
});
