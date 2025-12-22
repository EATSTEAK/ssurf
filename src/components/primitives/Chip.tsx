import { View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  chip: {
    borderRadius: theme.cornerRadius.md,
    paddingVertical: theme.gap(0.5),
    paddingHorizontal: theme.gap(1),
  },
}));

interface ChipProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Chip = ({ children, style }: ChipProps) => {
  return (
    <View style={[styles.chip, style]}>
      <ThemedText color="fgSuccessContainer" typography="labelMd">
        {children}
      </ThemedText>
    </View>
  );
};
