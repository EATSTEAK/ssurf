import * as ProgressPrimitive from '@rn-primitives/progress';
import { ComponentProps } from 'react';
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
  indicator: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    width: '100%',
    transitionProperty: 'width',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-in-out',
    flex: 1,
  },
}));

export const Progress = ({ style, ...props }: ComponentProps<typeof ProgressPrimitive.Root>) => {
  return (
    <ProgressPrimitive.Root {...props} style={[styles.root, style]}>
      <ProgressPrimitive.Indicator
        style={[
          styles.indicator,
          // TODO: Fix width calculation
          { transform: `translateX(-${400 - (props.value! / props.max!) * 400}%)` },
        ]}
      />
    </ProgressPrimitive.Root>
  );
};
