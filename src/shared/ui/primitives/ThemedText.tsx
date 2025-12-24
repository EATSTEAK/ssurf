import React from 'react';
import { Text, TextProps } from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  text: (color: keyof typeof theme.colors) => ({
    variants: {
      // Typography variants
      typography: {
        // Heading variants
        headingSm: theme.typography.heading.sm,
        headingMd: theme.typography.heading.md,
        headingLg: theme.typography.heading.lg,
        headingXl: theme.typography.heading.xl,
        heading2xl: theme.typography.heading['2xl'],
        heading3xl: theme.typography.heading['3xl'],
        // Label variants
        labelSm: theme.typography.label.sm,
        labelMd: theme.typography.label.md,
        labelLg: theme.typography.label.lg,
        // Body variants
        bodySm: theme.typography.body.sm,
        bodyMd: theme.typography.body.md,
        bodyLg: theme.typography.body.lg,
        default: theme.typography.body.md,
      },
    },
    color: theme.colors[color] ?? theme.colors.fgSurface,
  }),
}));

export type ThemedTextProps = React.RefAttributes<Text> &
  TextProps &
  UnistylesVariants<typeof styles> & {
    color?: Parameters<typeof styles.text>[0];
  };

/**
 * A ThemedText component that supports typography and color variants.
 *
 * Typography variants:
 * - headingSm, headingMd, headingLg, headingXl, heading2xl, heading3xl
 * - labelSm, labelMd, labelLg
 * - bodySm, bodyMd, bodyLg
 *
 * Color variants:
 * - any colors
 *
 * @example
 * <ThemedText typography="headingLg" color="fgPrimary">Title</ThemedText>
 * <ThemedText typography="bodyMd">Body text</ThemedText>
 */
export const ThemedText = ({ color, typography, style, ...props }: ThemedTextProps) => {
  styles.useVariants({ typography });

  return <Text {...props} style={[styles.text(color ?? 'fgSurface'), style]} />;
};
