// TODO: Remove example theme and replace with ssurf themes
import { StyleSheet } from 'react-native-unistyles';

import { palette, paletteHex } from '@/shared/lib/theme';
import { scheduleCourseColorsDark, scheduleCourseColorsLight } from '@/shared/lib/theme/schedule';

const cornerRadius = {
  none: 0,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  '2xl': 36,
  '3xl': 44,
  full: 9999,
};

const typography = {
  heading: {
    sm: {
      fontFamily: 'Pretendard',
      fontWeight: '500', // Medium
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    },
    md: {
      fontFamily: 'Pretendard',
      fontWeight: '500', // Medium
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
    },
    lg: {
      fontFamily: 'Pretendard',
      fontWeight: '600', // SemiBold
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0,
    },
    xl: {
      fontFamily: 'Pretendard',
      fontWeight: '600', // SemiBold
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },
    '2xl': {
      fontFamily: 'Pretendard',
      fontWeight: '600', // SemiBold
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
    '3xl': {
      fontFamily: 'Pretendard',
      fontWeight: '600', // SemiBold
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
    },
  },
  label: {
    sm: {
      fontFamily: 'Pretendard',
      fontWeight: '500', // Medium
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0,
    },
    md: {
      fontFamily: 'Pretendard',
      fontWeight: '500', // Medium
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
    },
    lg: {
      fontFamily: 'Pretendard',
      fontWeight: '400', // Regular
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    },
  },
  body: {
    sm: {
      fontFamily: 'Pretendard',
      fontWeight: '400', // Regular
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
    },
    md: {
      fontFamily: 'Pretendard',
      fontWeight: '400', // Regular
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    },
    lg: {
      fontFamily: 'Pretendard',
      fontWeight: '400', // Regular
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
    },
  },
} as const;

const lightTheme = {
  colors: {
    primary: palette.wave400,
    primaryPressed: palette.wave500,
    primaryInverted: palette.wave600,
    fgPrimary: palette.wave950,
    secondary: palette.sand400,
    secondaryPressed: palette.sand500,
    secondaryInverted: palette.sand600,
    fgSecondary: palette.sand950,
    success: palette.kelp400,
    successPressed: palette.kelp500,
    successInverted: palette.kelp600,
    fgSuccess: palette.kelp950,
    error: palette.coral400,
    errorPressed: palette.coral500,
    errorInverted: palette.coral600,
    fgError: palette.coral950,
    surface: palette.sand100,
    fgSurface: palette.sand950,
    surfaceDim: palette.sand50,
    fgSurfaceDim: palette.sand900,
    surfaceDimmer: palette.sand200,
    fgSurfaceDimmer: palette.sand800,
    fgSurfaceMuted: palette.neutral700,
    primaryContainer: palette.wave100,
    fgPrimaryContainer: palette.wave900,
    successContainer: palette.kelp100,
    fgSuccessContainer: palette.kelp900,
    errorContainer: palette.coral100,
    fgErrorContainer: palette.coral900,
  },
  colorsHex: {
    primary: paletteHex.wave400,
    primaryPressed: paletteHex.wave500,
    primaryInverted: paletteHex.wave600,
    fgPrimary: paletteHex.wave950,
    secondary: paletteHex.sand400,
    secondaryPressed: paletteHex.sand500,
    secondaryInverted: paletteHex.sand600,
    fgSecondary: paletteHex.sand950,
    success: paletteHex.kelp400,
    successPressed: paletteHex.kelp500,
    successInverted: paletteHex.kelp600,
    fgSuccess: paletteHex.kelp950,
    error: paletteHex.coral400,
    errorPressed: paletteHex.coral500,
    errorInverted: paletteHex.coral600,
    fgError: paletteHex.coral950,
    surface: paletteHex.sand100,
    fgSurface: paletteHex.sand950,
    surfaceDim: paletteHex.sand50,
    fgSurfaceDim: paletteHex.sand900,
    surfaceDimmer: paletteHex.sand200,
    fgSurfaceDimmer: paletteHex.sand800,
    fgSurfaceMuted: paletteHex.neutral700,
    primaryContainer: paletteHex.wave100,
    fgPrimaryContainer: paletteHex.wave900,
    successContainer: paletteHex.kelp100,
    fgSuccessContainer: paletteHex.kelp900,
    errorContainer: paletteHex.coral100,
    fgErrorContainer: paletteHex.coral900,
  },
  schedule: {
    courseColors: scheduleCourseColorsLight,
  },
  cornerRadius,
  typography,
  gap: (v: number) => v * 8,
} as const;

const darkTheme = {
  colors: {
    primary: palette.wave600,
    primaryPressed: palette.wave500,
    primaryInverted: palette.wave400,
    fgPrimary: palette.wave50,
    secondary: palette.sand600,
    secondaryPressed: palette.sand500,
    secondaryInverted: palette.sand400,
    fgSecondary: palette.sand50,
    success: palette.kelp600,
    successPressed: palette.kelp500,
    successInverted: palette.kelp400,
    fgSuccess: palette.sand50,
    error: palette.coral600,
    errorPressed: palette.coral500,
    errorInverted: palette.coral400,
    fgError: palette.sand50,
    surface: palette.sand950,
    fgSurface: palette.sand50,
    surfaceDim: palette.sand900,
    fgSurfaceDim: palette.sand100,
    surfaceDimmer: palette.sand800,
    fgSurfaceDimmer: palette.sand200,
    fgSurfaceMuted: palette.neutral300,
    primaryContainer: palette.wave900,
    fgPrimaryContainer: palette.wave100,
    successContainer: palette.kelp900,
    fgSuccessContainer: palette.kelp100,
    errorContainer: palette.coral900,
    fgErrorContainer: palette.coral100,
  },
  colorsHex: {
    primary: paletteHex.wave600,
    primaryPressed: paletteHex.wave500,
    primaryInverted: paletteHex.wave400,
    fgPrimary: paletteHex.wave50,
    secondary: paletteHex.sand600,
    secondaryPressed: paletteHex.sand500,
    secondaryInverted: paletteHex.sand400,
    fgSecondary: paletteHex.sand50,
    success: paletteHex.kelp600,
    successPressed: paletteHex.kelp500,
    successInverted: paletteHex.kelp400,
    fgSuccess: paletteHex.sand50,
    error: paletteHex.coral600,
    errorPressed: paletteHex.coral500,
    errorInverted: paletteHex.coral400,
    fgError: paletteHex.sand50,
    surface: paletteHex.sand950,
    fgSurface: paletteHex.sand50,
    surfaceDim: paletteHex.sand900,
    fgSurfaceDim: paletteHex.sand100,
    surfaceDimmer: paletteHex.sand800,
    fgSurfaceDimmer: paletteHex.sand200,
    fgSurfaceMuted: paletteHex.neutral300,
    primaryContainer: paletteHex.wave900,
    fgPrimaryContainer: paletteHex.wave100,
    successContainer: paletteHex.kelp900,
    fgSuccessContainer: paletteHex.kelp100,
    errorContainer: paletteHex.coral900,
    fgErrorContainer: paletteHex.coral100,
  },
  schedule: {
    courseColors: scheduleCourseColorsDark,
  },
  cornerRadius,
  typography,
  gap: (v: number) => v * 8,
} as const;

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  themes: appThemes,
  breakpoints,
});
