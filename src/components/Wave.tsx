import Svg, { Path, SvgProps } from 'react-native-svg';
import { StyleSheet, UnistylesVariants, withUnistyles } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  path: {
    variants: {
      color: {
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
        },
        success: {
          backgroundColor: theme.colors.success,
        },
        error: {
          backgroundColor: theme.colors.error,
        },
        surface: {
          backgroundColor: theme.colors.surface,
        },
        surfaceDim: {
          backgroundColor: theme.colors.surfaceDim,
        },
        surfaceDimmer: {
          backgroundColor: theme.colors.surfaceDimmer,
        },
        default: {
          backgroundColor: theme.colors.primary,
        },
      },
    },
  },
}));

export const Wave = withUnistyles(
  ({ color, ...props }: SvgProps & UnistylesVariants<typeof styles>) => {
    styles.useVariants({ color });
    return (
      <Svg preserveAspectRatio="none" viewBox="0 0 100 40" {...props}>
        <Path
          d="M0,20 Q12.5,35 25,20 T50,20 T75,20 T100,20 L100,0 L0,0 Z"
          fill={styles.path.backgroundColor}
        />
        <Path
          d="M0,22 Q12.5,32 25,22 T50,22 T75,22 T100,22 L100,0 L0,0 Z"
          fill={styles.path.backgroundColor}
          opacity="0.6"
        />
      </Svg>
    );
  },
);
