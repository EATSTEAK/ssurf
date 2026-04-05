import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/shared/ui/primitives/ThemedText';

export type ViewMode = 'month' | 'week';

type ViewModeSegmentedControlProps = {
  onChange: (mode: ViewMode) => void;
  value: ViewMode;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(1.5),
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.cornerRadius.md,
    flex: 1,
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.25),
  },
  buttonActive: {
    backgroundColor: theme.colors.primary,
  },
}));

export function ViewModeSegmentedControl({ onChange, value }: ViewModeSegmentedControlProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange('week')}
        style={[styles.button, value === 'week' && styles.buttonActive]}
      >
        <ThemedText color={value === 'week' ? 'fgPrimary' : 'fgSurface'} typography="labelMd">
          주간
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => onChange('month')}
        style={[styles.button, value === 'month' && styles.buttonActive]}
      >
        <ThemedText color={value === 'month' ? 'fgPrimary' : 'fgSurface'} typography="labelMd">
          월간
        </ThemedText>
      </Pressable>
    </View>
  );
}
