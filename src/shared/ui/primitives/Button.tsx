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
  container: ({ pressed }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    width: '100%',
    height: 40,
    variants: {
      variant: {
        primary: {
          backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primary,
        },
        secondary: {
          backgroundColor: pressed ? theme.colors.secondaryPressed : theme.colors.secondary,
        },
        error: {
          backgroundColor: pressed ? theme.colors.errorPressed : theme.colors.error,
        },
        success: {
          backgroundColor: pressed ? theme.colors.successPressed : theme.colors.success,
        },
        ghost: {
          backgroundColor: pressed ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
        },
        outline: {
          borderWidth: 1,
          borderColor: pressed ? theme.colors.fgSurfaceMuted : theme.colors.fgSurface,
          backgroundColor: pressed ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
        },
        surface: {
          backgroundColor: pressed ? theme.colors.surfaceDim : theme.colors.surface,
        },
      },
    },
  }),
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
  ...props
}: ButtonProps) => {
  styles.useVariants({ variant });

  return (
    <Pressable
      style={(state) => [styles.container(state), propagateState(state, style)]}
      {...props}
    >
      {(state) => (
        <Text style={[styles.text, propagateState(state, textStyle)]}>
          {propagateState(state, children)}
        </Text>
      )}
    </Pressable>
  );
};
