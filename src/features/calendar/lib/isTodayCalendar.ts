import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import { CalendarEntity } from '@/entities/calendar/model';

const resolveRange = (item: CalendarEntity) => {
  const start = item.startsAt ?? item.endsAt;
  const end = item.endsAt ?? item.startsAt;

  if (!start || !end) {
    return null;
  }

  return {
    end: Math.max(start, end),
    start: Math.min(start, end),
  };
};

export const getCalendarDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const getMonthDateKey = (date: Date) => format(date, 'yyyy-MM-01');

export const parseCalendarDateKey = (dateKey: string) => parseISO(dateKey);

export function isTodayCalendar(item: CalendarEntity, now: Date) {
  const range = resolveRange(item);

  if (!range) {
    return false;
  }

  return range.start <= endOfDay(now).getTime() && range.end >= startOfDay(now).getTime();
}

export function isCalendarOnDate(item: CalendarEntity, date: Date) {
  const range = resolveRange(item);

  if (!range) {
    return false;
  }

  return range.start <= endOfDay(date).getTime() && range.end >= startOfDay(date).getTime();
}

export function getCalendarDateKeysInMonth(item: CalendarEntity, visibleMonth: Date) {
  const range = resolveRange(item);

  if (!range) {
    return [];
  }

  const monthStart = startOfMonth(visibleMonth).getTime();
  const monthEnd = endOfMonth(visibleMonth).getTime();
  const intervalStart = Math.max(range.start, monthStart);
  const intervalEnd = Math.min(range.end, monthEnd);

  if (intervalStart > intervalEnd) {
    return [];
  }

  return eachDayOfInterval({
    end: startOfDay(new Date(intervalEnd)),
    start: startOfDay(new Date(intervalStart)),
  }).map(getCalendarDateKey);
}

export const getWeekDateKey = (date: Date) =>
  getCalendarDateKey(startOfWeek(date, { weekStartsOn: 1 }));

export function getCalendarDateKeysInWeek(item: CalendarEntity, visibleDate: Date) {
  const range = resolveRange(item);

  if (!range) {
    return [];
  }

  const weekStart = startOfWeek(visibleDate, { weekStartsOn: 1 }).getTime();
  const weekEnd = endOfWeek(visibleDate, { weekStartsOn: 1 }).getTime();
  const intervalStart = Math.max(range.start, weekStart);
  const intervalEnd = Math.min(range.end, weekEnd);

  if (intervalStart > intervalEnd) {
    return [];
  }

  return eachDayOfInterval({
    end: startOfDay(new Date(intervalEnd)),
    start: startOfDay(new Date(intervalStart)),
  }).map(getCalendarDateKey);
}
