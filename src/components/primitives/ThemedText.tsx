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
        headingSm: {
          fontSize: 14,
          lineHeight: 20,
          fontWeight: '500' as const,
        },
        headingMd: {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: '500' as const,
        },
        headingLg: {
          fontSize: 22,
          lineHeight: 28,
          fontWeight: '400' as const,
        },
        headingXl: {
          fontSize: 24,
          lineHeight: 32,
          fontWeight: '400' as const,
        },
        heading2xl: {
          fontSize: 28,
          lineHeight: 36,
          fontWeight: '400' as const,
        },
        heading3xl: {
          fontSize: 32,
          lineHeight: 40,
          fontWeight: '400' as const,
        },
        // Label variants
        labelSm: {
          fontSize: 11,
          lineHeight: 16,
          fontWeight: '500' as const,
        },
        labelMd: {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '500' as const,
        },
        labelLg: {
          fontSize: 14,
          lineHeight: 20,
          fontWeight: '400' as const,
        },
        // Body variants
        bodySm: {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '400' as const,
        },
        bodyMd: {
          fontSize: 14,
          lineHeight: 20,
          fontWeight: '400' as const,
        },
        bodyLg: {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: '400' as const,
        },
        default: {
          fontSize: 14,
          lineHeight: 20,
          fontWeight: '400' as const,
        },
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
