import { View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText, ThemedTextProps } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  chip: (backgroundColor: keyof typeof theme.colors) => ({
    borderRadius: theme.cornerRadius.md,
    paddingVertical: theme.gap(0.5),
    paddingHorizontal: theme.gap(1),
    backgroundColor: theme.colors[backgroundColor],
  }),
}));

interface ChipProps {
  backgroundColor?: Parameters<typeof styles.chip>[0];
  children: React.ReactNode;
  color?: ThemedTextProps['color'];
  style?: ViewStyle;
}

export const Chip = ({
  children,
  style,
  color = 'fgPrimaryContainer',
  backgroundColor = 'primaryContainer',
}: ChipProps) => {
  return (
    <View style={[styles.chip(backgroundColor), style]}>
      <ThemedText color={color} typography="labelMd">
        {children}
      </ThemedText>
    </View>
  );
};
