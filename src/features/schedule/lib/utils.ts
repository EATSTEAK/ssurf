import { CourseScheduleEntity } from '@/entities/courseSchedule/model';

export const parseTimeRange = (time: string): { endMinutes: number; startMinutes: number } => {
  const match = time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) {
    return { startMinutes: 0, endMinutes: 0 };
  }
  const startMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  const endMinutes = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
  return { startMinutes, endMinutes };
};

export const getGridBounds = (
  data: CourseScheduleEntity[],
): { endHour: number; startHour: number; weekdays: number[] } => {
  if (data.length === 0) {
    return { startHour: 9, endHour: 18, weekdays: [0, 1, 2, 3, 4] };
  }

  let minStart = 24 * 60;
  let maxEnd = 0;
  const weekdaySet = new Set<number>();

  for (const item of data) {
    const { startMinutes, endMinutes } = parseTimeRange(item.time);
    if (startMinutes < minStart) {
      minStart = startMinutes;
    }
    if (endMinutes > maxEnd) {
      maxEnd = endMinutes;
    }
    weekdaySet.add(item.weekday);
  }

  const startHour = Math.floor(minStart / 60);
  const endHour = Math.ceil(maxEnd / 60);
  const weekdays = Array.from(weekdaySet).sort((a, b) => a - b);

  return { startHour, endHour, weekdays };
};

const COURSE_COLORS = [
  { bg: 'hsl(183, 77%, 92%)', fg: 'hsl(184, 87%, 9%)' },
  { bg: 'hsl(38, 100%, 94%)', fg: 'hsl(40, 60%, 11%)' },
  { bg: 'hsl(102, 40%, 87%)', fg: 'hsl(100, 35%, 11%)' },
  { bg: 'hsl(8, 97%, 92%)', fg: 'hsl(7, 36%, 15%)' },
  { bg: 'hsl(183, 86%, 80%)', fg: 'hsl(184, 74%, 18%)' },
  { bg: 'hsl(39, 99%, 67%)', fg: 'hsl(40, 50%, 23%)' },
  { bg: 'hsl(101, 37%, 76%)', fg: 'hsl(100, 29%, 23%)' },
  { bg: 'hsl(8, 91%, 85%)', fg: 'hsl(7, 31%, 29%)' },
];

const COURSE_COLORS_DARK = [
  { bg: 'hsl(184, 74%, 18%)', fg: 'hsl(183, 77%, 92%)' },
  { bg: 'hsl(40, 50%, 22%)', fg: 'hsl(38, 100%, 94%)' },
  { bg: 'hsl(100, 29%, 23%)', fg: 'hsl(102, 40%, 87%)' },
  { bg: 'hsl(7, 31%, 29%)', fg: 'hsl(8, 97%, 92%)' },
  { bg: 'hsl(184, 87%, 9%)', fg: 'hsl(183, 86%, 80%)' },
  { bg: 'hsl(40, 60%, 11%)', fg: 'hsl(39, 99%, 67%)' },
  { bg: 'hsl(100, 35%, 11%)', fg: 'hsl(101, 37%, 76%)' },
  { bg: 'hsl(7, 36%, 15%)', fg: 'hsl(8, 91%, 85%)' },
];

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
  name: string,
  isDark: boolean,
): { bg: string; fg: string } => {
  const colors = isDark ? COURSE_COLORS_DARK : COURSE_COLORS;
  const index = hashString(name) % colors.length;
  return colors[index];
};

export const HOUR_HEIGHT = 60;

export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
