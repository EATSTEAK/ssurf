import { ComponentProps } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { propagateState } from '@/shared/lib/propagateState';

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

export interface ChunkedProgressProps extends ComponentProps<typeof View> {
  indicatorStyle?: ((index: number) => StyleProp<ViewStyle>) | StyleProp<ViewStyle>;
  max?: number;
  value?: number;
}

export const ChunkedProgress = ({
  indicatorStyle,
  max,
  style,
  value,
  ...props
}: ChunkedProgressProps) => {
  const segmentCount = Math.max(0, Math.floor(max ?? 100));
  const resolvedValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: segmentCount,
        min: 0,
        now: Math.min(Math.max(resolvedValue, 0), segmentCount),
      }}
      {...props}
      style={[styles.root, style]}
    >
      {Array.from({ length: segmentCount }, (_, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            styles.indicator({ disabled: index >= resolvedValue }),
            propagateState(index, indicatorStyle),
          ]}
        />
      ))}
    </View>
  );
};
