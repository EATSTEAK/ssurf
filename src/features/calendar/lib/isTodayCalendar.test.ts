import { describe, expect, it } from 'vitest';

import { CalendarEntity } from '@/entities/calendar/model';

import { findCalendarIndexForDate, isTodayCalendar } from './isTodayCalendar';

const calendar = (startDay: number, endDay = startDay): CalendarEntity => ({
  description: null,
  endsAt: new Date(2026, 7, endDay, 23, 59, 59).getTime(),
  id: `${startDay}-${endDay}`,
  location: null,
  slug: 'academic',
  startsAt: new Date(2026, 7, startDay).getTime(),
  title: '학사 일정',
  url: null,
});

describe('isTodayCalendar', () => {
  it.each([
    ['same-day schedule', calendar(2), true],
    ['ongoing schedule', calendar(1, 3), true],
    ['first day of a schedule', calendar(2, 3), true],
    ['last day of a schedule', calendar(1, 2), true],
    ['past schedule', calendar(1), false],
    ['future schedule', calendar(3), false],
    ['start-only schedule', { ...calendar(2), endsAt: null }, true],
    ['end-only schedule', { ...calendar(2), startsAt: null }, true],
    ['undated schedule', { ...calendar(2), startsAt: null, endsAt: null }, false],
  ])('filters %s for the feed preview', (_, item, expected) => {
    expect(isTodayCalendar(item, new Date(2026, 7, 2, 12))).toBe(expected);
  });
});

describe('findCalendarIndexForDate', () => {
  const items = [calendar(1, 3), calendar(10), calendar(20)];

  it('finds an active, next, or final schedule in chronological data', () => {
    expect(findCalendarIndexForDate(items, new Date(2026, 7, 2))).toBe(0);
    expect(findCalendarIndexForDate(items, new Date(2026, 7, 5))).toBe(1);
    expect(findCalendarIndexForDate(items, new Date(2026, 7, 25))).toBe(2);
    expect(findCalendarIndexForDate([], new Date(2026, 7, 5))).toBe(-1);
  });
});
