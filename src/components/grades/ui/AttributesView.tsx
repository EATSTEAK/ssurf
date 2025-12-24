import { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  summaryView: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(1),
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attributeView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(0.5),
    minWidth: '33%',
    flexGrow: 1,
  },
}));

export function AttributesView({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <View style={styles.summaryView}>
      {items.map((item) => (
        <View key={item.label} style={styles.attributeView}>
          <ThemedText color="fgSurfaceMuted" typography="bodyMd">
            {item.label}
          </ThemedText>
          <ThemedText style={{ fontWeight: '600' }} typography="bodyLg">
            {item.value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}
