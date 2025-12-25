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

export interface AttributeItem {
  base?: ReactNode;
  label: string;
  value: ReactNode;
}
export interface AttributesViewProps {
  items: AttributeItem[];
}

export function AttributesView({ items }: AttributesViewProps) {
  return (
    <View style={styles.summaryView}>
      {items.map((item) => (
        <View key={item.label} style={styles.attributeView}>
          <ThemedText color="fgSurfaceMuted" typography="bodyMd">
            {item.label}
          </ThemedText>
          <ThemedText style={{ fontWeight: '600' }} typography="bodyLg">
            {item.value}
            {item.base ? (
              <>
                {' '}
                <ThemedText
                  color="fgSurfaceMuted"
                  style={{ fontWeight: '400' }}
                  typography="bodySm"
                >
                  / {item.base}
                </ThemedText>
              </>
            ) : null}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}
