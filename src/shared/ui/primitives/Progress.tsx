import { ComponentProps } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: 10,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.cornerRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    left: 0,
    top: 0,
    position: 'absolute',
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
}));

const getProgressWidth = (value: number, max: number): `${number}%` => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return `${percentage}%`;
};

export interface ProgressProps extends ComponentProps<typeof View> {
  indicatorStyle?: StyleProp<ViewStyle>;
  max?: number;
  value?: number;
}

export const Progress = ({ indicatorStyle, max, style, value, ...props }: ProgressProps) => {
  const resolvedMax = typeof max === 'number' && Number.isFinite(max) && max > 0 ? max : 100;
  const resolvedValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ max: resolvedMax, min: 0, now: Math.min(resolvedValue, resolvedMax) }}
      {...props}
      style={[styles.root, style]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.indicator,
          { width: getProgressWidth(resolvedValue, resolvedMax) },
          indicatorStyle,
        ]}
      />
    </View>
  );
};
