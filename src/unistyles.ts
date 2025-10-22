// TODO: Remove example theme and replace with ssurf themes
import { StyleSheet } from 'react-native-unistyles';

const palette = {
  sand50: 'hsl(0 0% 97.84%)',
  sand100: 'hsl(0 0% 93.73%)',
  sand200: 'hsl(0 0% 82.88%)',
  sand300: 'hsl(0 0% 67.49%)',
  sand400: 'hsl(0 0% 59.89%)',
  sand500: 'hsl(0 0% 53.76%)',
  sand600: 'hsl(240 0% 41%)',
  sand700: 'hsl(0 0% 32.96%)',
  sand800: 'hsl(0 0% 22.16%)',
  sand900: 'hsl(0 0% 11.16%)',
  sand950: 'hsl(0 0% 0%)',
  wave50: 'hsl(0 0% 97.86%)',
  wave100: 'hsl(0 0% 92.16%)',
  wave200: 'hsl(0 0% 79.97%)',
  wave300: 'hsl(0 0% 52.7%)',
  wave400: 'hsl(0 0% 44.35%)',
  wave500: 'hsl(0 0% 39.34%)',
  wave600: 'hsl(0 0% 28.92%)',
  wave700: 'hsl(0 0% 25.47%)',
  wave800: 'hsl(0 0% 18.03%)',
  wave900: 'hsl(0 0% 8.75%)',
  wave950: 'hsl(0 0% 0%)',
  neutral50: 'hsl(0 0% 98.68%)',
  neutral100: 'hsl(0 0% 96.06%)',
  neutral200: 'hsl(0 0% 89.56%)',
  neutral300: 'hsl(0 0% 81.87%)',
  neutral400: 'hsl(0 0% 73.08%)',
  neutral500: 'hsl(0 0% 63.26%)',
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
