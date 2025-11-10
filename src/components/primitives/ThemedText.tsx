import React from 'react';
import { Text, TextProps } from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      // Color variants
      color: {
        primary: {
          color: theme.colors.fgPrimary,
        },
        secondary: {
          color: theme.colors.fgSecondary,
        },
        cardPrimary: {
          color: theme.colors.fgCardPrimary,
        },
        cardSecondary: {
          color: theme.colors.fgCardSecondary,
        },
        surface: {
          color: theme.colors.fgSurface,
        },
        default: {
          color: theme.colors.fgSurface,
        },
      },
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
  },
}));

export type ThemedTextProps = React.RefAttributes<Text> &
  TextProps &
  UnistylesVariants<typeof styles>;

/**
 * A ThemedText component that supports typography and color variants.
 *
 * Typography variants:
 * - headingSm, headingMd, headingLg, headingXl, heading2xl, heading3xl
 * - labelSm, labelMd, labelLg
 * - bodySm, bodyMd, bodyLg
 *
 * Color variants:
 * - primary, secondary, surface, cardPrimary, cardSecondary
 *
 * @example
 * <ThemedText typography="headingLg" color="primary">Title</ThemedText>
 * <ThemedText typography="bodyMd">Body text</ThemedText>
 */
export const ThemedText = ({ color, typography, style, ...props }: ThemedTextProps) => {
  styles.useVariants({ color, typography });

  return <Text {...props} style={[styles.text, style]} />;
};
