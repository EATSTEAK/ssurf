import React from 'react';
import { Pressable, PressableProps, Text, View } from 'react-native';
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
    children: React.ReactNode;
  };

export const Button = ({ variant, ...props }: ButtonProps) => {
  styles.useVariants({ variant: variant ?? 'primary' });
  return (
    <Pressable {...props}>
      <View style={styles.container}>
        <Text style={styles.text}>{props.children}</Text>
      </View>
    </Pressable>
  );
};
