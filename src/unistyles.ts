// TODO: Remove example theme and replace with ssurf themes
import { StyleSheet } from 'react-native-unistyles';

export const palette = {
  sand50: 'hsl(38.31 62.8% 96.64%)',
  sand100: 'hsl(38.33 100% 93.81%)',
  sand200: 'hsl(38.58 100% 82.98%)',
  sand300: 'hsl(39.9 99.48% 67.49%)',
  sand400: 'hsl(39.96 73.56% 59.89%)',
  sand500: 'hsl(39.95 57.73% 53.77%)',
  sand600: 'hsl(40.04 52.37% 40.64%)',
  sand700: 'hsl(39.71 48.66% 32.95%)',
  sand800: 'hsl(39.62 50.49% 22.16%)',
  sand900: 'hsl(39.62 60.38% 11.16%)',
  sand950: 'hsl(39.14 61.77% 7.55%)',
  wave50: 'hsl(183.92 57.31% 96.55%)',
  wave100: 'hsl(184.07 77% 92.16%)',
  wave200: 'hsl(184.28 86.32% 79.98%)',
  wave300: 'hsl(183.5 88.64% 52.7%)',
  wave400: 'hsl(183.33 90.48% 44.35%)',
  wave500: 'hsl(183.32 92.75% 39.33%)',
  wave600: 'hsl(183.16 100% 27.36%)',
  wave700: 'hsl(183.66 78.26% 25.46%)',
  wave800: 'hsl(183.82 73.81% 18.04%)',
  wave900: 'hsl(184.02 87.16% 8.75%)',
  wave950: 'hsl(184.38 80.95% 6.03%)',
  coral50: 'hsl(8.01 100% 98.01%)',
  coral100: 'hsl(8.01 62.31% 96.69%)',
  coral200: 'hsl(7.85 97.19% 91.83%)',
  coral300: 'hsl(7.59 91.45% 85.38%)',
  coral400: 'hsl(7.05 95.66% 78.95%)',
  coral500: 'hsl(6.75 75.05% 71.53%)',
  coral600: 'hsl(6.73 37.7% 55.02%)',
  coral700: 'hsl(6.82 30.36% 42.82%)',
  coral800: 'hsl(6.86 31.43% 29.03%)',
  coral900: 'hsl(6.86 35.93% 15.3%)',
  coral950: 'hsl(6.99 37.76% 10.39%)',
  kelp50: 'hsl(101.9 40.25% 96.77%)',
  kelp100: 'hsl(101.9 28.58% 95.46%)',
  kelp200: 'hsl(101.67 39.83% 87.08%)',
  kelp300: 'hsl(101.35 37.29% 76.13%)',
  kelp400: 'hsl(100.69 39.23% 64.31%)',
  kelp500: 'hsl(100.28 34.58% 56.05%)',
  kelp600: 'hsl(100.23 28.52% 42.34%)',
  kelp700: 'hsl(100.39 27.25% 33.8%)',
  kelp800: 'hsl(100.43 28.7% 22.45%)',
  kelp900: 'hsl(100.39 35.13% 11.02%)',
  kelp950: 'hsl(100.66 34.35% 8.01%)',
  neutral50: 'hsl(0 0% 98.68%)',
  neutral100: 'hsl(0 0% 96.06%)',
  neutral200: 'hsl(160 0% 89.56%)',
  neutral300: 'hsl(180 0% 81.87%)',
  neutral400: 'hsl(0 0% 73.08%)',
  neutral500: 'hsl(180 0% 63.26%)',
  neutral600: 'hsl(120 0% 51.37%)',
  neutral700: 'hsl(0 0% 41.09%)',
  neutral800: 'hsl(0 0% 29.11%)',
  neutral900: 'hsl(0 0% 17.92%)',
  neutral950: 'hsl(0 0% 7.73%)',
};

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
    surface: palette.sand50,
    fgSurface: palette.sand950,
    surfaceDim: palette.sand100,
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
