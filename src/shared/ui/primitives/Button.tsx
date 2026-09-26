import React from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  Text,
  TextStyle,
  View,
} from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

import { propagateState } from '@/shared/lib/propagateState';

const styles = StyleSheet.create((theme) => ({
  container: ({ pressed }: PressableStateCallbackType, disabled: boolean) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    width: '100%',
    height: 40,
    opacity: disabled ? 0.5 : 1,
    variants: {
      variant: {
        primary: {
          backgroundColor: disabled
            ? theme.colors.primaryContainer
            : pressed
              ? theme.colors.primaryPressed
              : theme.colors.primary,
        },
        secondary: {
          backgroundColor: disabled
            ? theme.colors.surface
            : pressed
              ? theme.colors.secondaryPressed
              : theme.colors.secondary,
        },
        error: {
          backgroundColor: disabled
            ? theme.colors.errorContainer
            : pressed
              ? theme.colors.errorPressed
              : theme.colors.error,
        },
        success: {
          backgroundColor: disabled
            ? theme.colors.successContainer
            : pressed
              ? theme.colors.successPressed
              : theme.colors.success,
        },
        ghost: {
          backgroundColor: pressed && !disabled ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
        },
        outline: {
          borderWidth: 1,
          borderColor: disabled || pressed ? theme.colors.fgSurfaceMuted : theme.colors.fgSurface,
          backgroundColor: pressed && !disabled ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
        },
        surface: {
          backgroundColor: disabled || pressed ? theme.colors.surfaceDim : theme.colors.surface,
        },
      },
    },
  }),
  textDisabled: {
    color: theme.colors.fgSurfaceMuted,
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    variants: {
      variant: {
        primary: {
          color: theme.colors.fgPrimary,
        },
        secondary: {
          color: theme.colors.fgSecondary,
        },
        error: {
          color: theme.colors.fgError,
        },
        success: {
          color: theme.colors.fgSuccess,
        },
        ghost: {
          color: theme.colors.fgSurface,
        },
        outline: {
          color: theme.colors.fgSurface,
        },
        surface: {
          color: theme.colors.fgSurface,
        },
      },
    },
  },
}));

export type ButtonProps = PressableProps &
  React.RefAttributes<View> &
  UnistylesVariants<typeof styles> & {
    textStyle?:
      | ((state: PressableStateCallbackType) => StyleProp<TextStyle>)
      | StyleProp<TextStyle>;
  };

export const Button = ({
  variant = 'primary',
  style,
  children,
  textStyle,
  disabled,
  ...props
}: ButtonProps) => {
  styles.useVariants({ variant });

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [styles.container(state, !!disabled), propagateState(state, style)]}
      {...props}
    >
      {(state) => {
        const content = propagateState(state, children);

        if (React.isValidElement(content)) {
          return content;
        }

        return (
          <Text
            style={[styles.text, disabled && styles.textDisabled, propagateState(state, textStyle)]}
          >
            {content}
          </Text>
        );
      }}
    </Pressable>
  );
};
