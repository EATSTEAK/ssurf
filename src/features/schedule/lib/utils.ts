import { CourseScheduleEntity } from '@/entities/courseSchedule/model';

export const formatMinutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

export const formatTimeRange = (startTime: number, endTime: number): string =>
  `${formatMinutesToTime(startTime)} - ${formatMinutesToTime(endTime)}`;

export const getGridBounds = (
  data: CourseScheduleEntity[],
): { endHour: number; startHour: number; weekdays: number[] } => {
  if (data.length === 0) {
    return { startHour: 9, endHour: 18, weekdays: [0, 1, 2, 3, 4] };
  }

  let minStart = 24 * 60;
  let maxEnd = 0;
  const weekdaySet = new Set<number>([0, 1, 2, 3, 4]);

  for (const item of data) {
    if (item.startTime < minStart) {
      minStart = item.startTime;
    }
    if (item.endTime > maxEnd) {
      maxEnd = item.endTime;
    }
    weekdaySet.add(item.weekday);
  }

  const startHour = Math.min(Math.floor(minStart / 60), 9);
  const endHour = Math.ceil(maxEnd / 60) + 1;
  const weekdays = Array.from(weekdaySet).sort((a, b) => a - b);

  return { startHour, endHour, weekdays };
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getCourseColor = (
  item: { classroom: string; startTime: number; weekday: number; },
  courseColors: ReadonlyArray<{ bg: string; fg: string }>,
): { bg: string; fg: string } => {
  const key = `${item.weekday}-${item.startTime}-${item.classroom}`;
  const index = hashString(key) % courseColors.length;
  return courseColors[index];
};

export const HOUR_HEIGHT = 40;

export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
