import { describe, expect, it } from 'vitest';

import { parseCourseCode, parseCourseScheduleRouteParams } from './courseRoute';

describe('course route params', () => {
  it('accepts the full RegistrationStatus course code', () => {
    expect(parseCourseCode('2150101506')).toBe('2150101506');
    expect(parseCourseCode('21501015')).toBeNull();
    expect(parseCourseCode('2150101506-01')).toBeNull();
  });

  it('parses a valid timetable entry', () => {
    expect(
      parseCourseScheduleRouteParams({
        classroom: '정보과학관 101호',
        endTime: '615',
        name: '자료구조',
        professor: '홍길동',
        semester: '0',
        startTime: '540',
        weekday: '0',
        year: '2026',
      }),
    ).toEqual({
      classroom: '정보과학관 101호',
      endTime: 615,
      name: '자료구조',
      professor: '홍길동',
      semester: 0,
      startTime: 540,
      weekday: 0,
      year: 2026,
    });
  });
});
