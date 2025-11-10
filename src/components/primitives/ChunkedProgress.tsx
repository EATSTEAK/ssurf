import * as ProgressPrimitive from '@rn-primitives/progress';
import { ComponentProps } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { propagateState } from '@/utils/propagateState';

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: 10,
    borderRadius: theme.cornerRadius.full,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
  },
  indicator: ({ disabled }: { disabled?: boolean }) => ({
    height: '100%',
    backgroundColor: disabled ? theme.colors.primaryContainer : theme.colors.primary,
    flex: 1,
  }),
}));

export const ChunkedProgress = ({
  style,
  indicatorStyle,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorStyle?: ((index: number) => StyleProp<ViewStyle>) | StyleProp<ViewStyle>;
}) => {
  return (
    <ProgressPrimitive.Root {...props} style={[styles.root, style]}>
      {[...Array(props.max ?? 100).keys()].map((index) => (
        <ProgressPrimitive.Indicator
          key={index}
          style={[
            styles.indicator({ disabled: index >= (props.value ?? 0) }),
            propagateState(index, indicatorStyle),
          ]}
        />
      ))}
    </ProgressPrimitive.Root>
  );
};
