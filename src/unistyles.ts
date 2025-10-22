// TODO: Remove example theme and replace with ssurf themes
import { StyleSheet } from 'react-native-unistyles';

const palette = {
  sand50: 'hsl(38.31 100% 97.95%)',
  sand100: 'hsl(38.33 100% 93.81%)',
  sand200: 'hsl(38.58 100% 82.98%)',
  sand300: 'hsl(39.9 99.48% 67.49%)',
  sand400: 'hsl(39.96 73.56% 59.89%)',
  sand500: 'hsl(39.95 57.73% 53.77%)',
  sand600: 'hsl(40.04 52.37% 40.64%)',
  sand700: 'hsl(39.71 48.66% 32.95%)',
  sand800: 'hsl(39.62 50.49% 22.16%)',
  sand900: 'hsl(39.62 60.38% 11.16%)',
  sand950: 'hsl(0 0% 0%)',
  wave50: 'hsl(183.92 92.7% 97.86%)',
  wave100: 'hsl(184.07 77% 92.16%)',
  wave200: 'hsl(184.28 86.32% 79.98%)',
  wave300: 'hsl(183.5 88.64% 52.7%)',
  wave400: 'hsl(183.33 90.48% 44.35%)',
  wave500: 'hsl(183.32 92.75% 39.33%)',
  wave600: 'hsl(183.16 100% 27.36%)',
  wave700: 'hsl(183.66 78.26% 25.46%)',
  wave800: 'hsl(183.82 73.81% 18.04%)',
  wave900: 'hsl(184.02 87.16% 8.75%)',
  wave950: 'hsl(0 0% 0%)',
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

const lightTheme = {
  colors: {
    primary: palette.wave400,
    secondary: palette.sand200,
    background: palette.sand50,
    backgroundCard: palette.sand100,
    foreground: palette.neutral950,
    foregroundMuted: palette.sand900,
  },
  gap: (v: number) => v * 8,
} as const;

const darkTheme = {
  colors: {
    primary: palette.wave600,
    secondary: palette.sand800,
    background: palette.neutral950,
    backgroundCard: palette.sand900,
    foreground: palette.sand50,
    foregroundMuted: palette.sand100,
  },
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
