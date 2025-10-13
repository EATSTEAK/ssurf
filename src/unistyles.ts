// TODO: Remove example theme and replace with ssurf themes
import { StyleSheet } from 'react-native-unistyles';

const palette = {
  sand50: 'oklch(0.99 0.01 82)',
  sand100: 'oklch(0.97 0.03 82)',
  sand200: 'oklch(0.92 0.08 82)',
  sand300: 'oklch(0.86 0.14 82)',
  sand400: 'oklch(0.79 0.13 82)',
  sand500: 'oklch(0.73 0.12 82)',
  sand600: 'oklch(0.6 0.1 82)',
  sand700: 'oklch(0.51 0.08 82)',
  sand800: 'oklch(0.39 0.06 82)',
  sand900: 'oklch(0.26 0.04 82)',
  sand950: 'oklch(0 0 82)',
  wave50: 'oklch(0.99 0.01 202)',
  wave100: 'oklch(0.96 0.03 202)',
  wave200: 'oklch(0.91 0.08 202)',
  wave300: 'oklch(0.84 0.14 202)',
  wave400: 'oklch(0.77 0.13 202)',
  wave500: 'oklch(0.71 0.12 202)',
  wave600: 'oklch(0.58 0.1 202)',
  wave700: 'oklch(0.49 0.08 202)',
  wave800: 'oklch(0.38 0.06 202)',
  wave900: 'oklch(0.25 0.04 202)',
  wave950: 'oklch(0 0 202)',
  neutral50: 'oklch(0.99 0 0)',
  neutral100: 'oklch(0.97 0 0)',
  neutral200: 'oklch(0.92 0 0)',
  neutral300: 'oklch(0.86 0 0)',
  neutral400: 'oklch(0.79 0 0)',
  neutral500: 'oklch(0.71 0 0)',
  neutral600: 'oklch(0.61 0 0)',
  neutral700: 'oklch(0.52 0 0)',
  neutral800: 'oklch(0.41 0 0)',
  neutral900: 'oklch(0.3 0 0)',
  neutral950: 'oklch(0.19 0 0)',
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
