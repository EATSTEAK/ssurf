import React from 'react';
import { Text, TextProps } from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      color: {
        muted: {
          color: theme.colors.foregroundMuted,
        },
        default: {
          color: theme.colors.foreground,
        },
      },
    },
  },
}));

export type ThemedTextProps = React.RefAttributes<Text> &
  TextProps &
  UnistylesVariants<typeof styles>;

/**
 * A simple Text wrapper that applies the current unistyles theme text color by default.
 * Pass `color` or `style` to override.
 */
export const ThemedText = ({ color, style, ...props }: ThemedTextProps) => {
  styles.useVariants({ color });

  return <Text {...props} style={[styles.text, style]} />;
};
