import * as ProgressPrimitive from '@rn-primitives/progress';
import { ComponentProps } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: 10,
    backgroundColor: theme.colors.cardPrimary,
    borderRadius: theme.cornerRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: ({ value, max }) => ({
    left: 0,
    top: 0,
    position: 'absolute',
    height: '100%',
    backgroundColor: theme.colors.primary,
    transitionProperty: 'width',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-in-out',
    flex: 1,
    width: `${((value ?? 0) / (max ?? 100)) * 100}%`,
  }),
}));

export const Progress = ({
  style,
  indicatorStyle,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & { indicatorStyle?: StyleProp<ViewStyle> }) => {
  return (
    <ProgressPrimitive.Root {...props} style={[styles.root, style]}>
      <ProgressPrimitive.Indicator
        style={[styles.indicator({ value: props.value, max: props.max }), indicatorStyle]}
      />
    </ProgressPrimitive.Root>
  );
};
