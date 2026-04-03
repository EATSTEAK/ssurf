import { CalendarEntity } from '@/entities/calendar/model';

export function isTodayCalendar(item: CalendarEntity, now: Date) {
  const start = item.startsAt ?? item.endsAt;
  const end = item.endsAt ?? item.startsAt;

  if (!start || !end) {
    return false;
  }

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return start <= endOfDay.getTime() && end >= startOfDay.getTime();
}
