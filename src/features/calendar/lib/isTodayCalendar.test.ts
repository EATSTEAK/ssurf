import { describe, expect, it } from 'vitest';

import { CalendarEntity } from '@/entities/calendar/model';

import { findCalendarIndexForDate } from './isTodayCalendar';

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

describe('findCalendarIndexForDate', () => {
  const items = [calendar(1, 3), calendar(10), calendar(20)];

  it('finds an active, next, or final schedule in chronological data', () => {
    expect(findCalendarIndexForDate(items, new Date(2026, 7, 2))).toBe(0);
    expect(findCalendarIndexForDate(items, new Date(2026, 7, 5))).toBe(1);
    expect(findCalendarIndexForDate(items, new Date(2026, 7, 25))).toBe(2);
    expect(findCalendarIndexForDate([], new Date(2026, 7, 5))).toBe(-1);
  });
});
