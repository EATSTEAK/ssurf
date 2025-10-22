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

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    width: '100%',
    height: 40,
    variants: {
      variant: {
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
        },
      },
    },
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    variants: {
      variant: {
        primary: {
          color: theme.colors.foreground,
        },
        secondary: {
          color: theme.colors.foreground,
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

const propagateState = <T,>(
  state: PressableStateCallbackType,
  v: ((state: PressableStateCallbackType) => T) | T,
): T => (typeof v === 'function' ? (v as (state: PressableStateCallbackType) => T)(state) : v);

export const Button = ({
  variant = 'primary',
  style,
  children,
  textStyle,
  ...props
}: ButtonProps) => {
  styles.useVariants({ variant });

  return (
    <Pressable style={(state) => [styles.container, propagateState(state, style)]} {...props}>
      {(state) => (
        <Text style={[styles.text, propagateState(state, textStyle)]}>
          {propagateState(state, children)}
        </Text>
      )}
    </Pressable>
  );
};
