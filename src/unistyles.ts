// TODO: Remove example theme and replace with ssurf themes
import { StyleSheet } from 'react-native-unistyles';

const palette = {
  sand50: 'oklch(0.9912 0.007812500000000002 82)',
  sand100: 'oklch(0.9673 0.03125000000000001 82)',
  sand200: 'oklch(0.9912 0.007812500000000002 82)',
  sand300: 'oklch(0.8578 0.14062500000000003 82)',
  sand400: 'oklch(0.7932 0.13125000000000003 82)',
  sand500: 'oklch(0.7301 0.12031250000000003 82)',
  sand600: 'oklch(0.5805 0.09531250000000001 82)',
  sand700: 'oklch(0.4852 0.07968750000000001 82)',
  sand800: 'oklch(0.3632 0.05937500000000001 82)',
  sand900: 'oklch(0.1983 0.03125000000000001 82)',
  sand950: 'oklch(0 0 82)',
  wave50: 'oklch(0.9888 0.007812500000000002 202)',
  wave100: 'oklch(0.9649 0.03125000000000001 202)',
  wave200: 'oklch(0.9114 0.0765625 202)',
  wave300: 'oklch(0.8359 0.14062500000000003 202)',
  wave400: 'oklch(0.774 0.13125000000000003 202)',
  wave500: 'oklch(0.7117 0.12031250000000003 202)',
  wave600: 'oklch(0.5629 0.09531250000000001 202)',
  wave700: 'oklch(0.4728 0.07968750000000001 202)',
  wave800: 'oklch(0.3537 0.05937500000000001 202)',
  wave900: 'oklch(0.1907 0.03125000000000001 202)',
  wave950: 'oklch(0 0 202)',
};

const lightTheme = {
  colors: {
    primary: palette.wave400,
    secondary: palette.sand200,
    background: palette.sand50,
    backgroundCard: palette.sand100,
    foreground: palette.sand900,
    foregroundMuted: palette.sand800,
    black: '#121212',
    white: '#f7f7f7',
  },
  gap: (v: number) => v * 8,
} as const;

const darkTheme = {
  colors: {
    primary: palette.wave600,
    secondary: palette.sand800,
    background: palette.sand900,
    backgroundCard: palette.sand800,
    foreground: palette.sand50,
    foregroundMuted: palette.sand100,
    black: '#121212',
    white: '#f7f7f7',
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
