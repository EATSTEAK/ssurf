import { palette } from '@/shared/lib/theme';

export type CourseColor = { bg: string; fg: string };

export const scheduleCourseColorsLight: CourseColor[] = [
  { bg: palette.wave100, fg: palette.wave900 },
  { bg: palette.sand100, fg: palette.sand900 },
  { bg: palette.kelp200, fg: palette.kelp900 },
  { bg: palette.coral200, fg: palette.coral900 },
  { bg: palette.wave200, fg: palette.wave800 },
  { bg: palette.sand300, fg: palette.sand800 },
  { bg: palette.kelp300, fg: palette.kelp800 },
  { bg: palette.coral300, fg: palette.coral800 },
];

export const scheduleCourseColorsDark: CourseColor[] = [
  { bg: palette.wave800, fg: palette.wave100 },
  { bg: palette.sand800, fg: palette.sand100 },
  { bg: palette.kelp800, fg: palette.kelp200 },
  { bg: palette.coral800, fg: palette.coral200 },
  { bg: palette.wave900, fg: palette.wave200 },
  { bg: palette.sand900, fg: palette.sand300 },
  { bg: palette.kelp900, fg: palette.kelp300 },
  { bg: palette.coral900, fg: palette.coral300 },
];
