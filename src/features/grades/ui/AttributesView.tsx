import { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useBlurGrade } from '@/features/grades/providers/BlurGradeProvider';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  summaryView: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(1),
    justifyContent: 'space-between',
  },
  attributeView: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: theme.gap(0.5),
    minWidth: '33%',
  },
  value: (isBlurred: boolean) => ({
    fontWeight: '600',
    opacity: isBlurred ? 0.1 : 1,
  }),
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
  const { isBlurred } = useBlurGrade();

  return (
    <View style={styles.summaryView}>
      {items.map((item) => (
        <View key={item.label} style={styles.attributeView}>
          <ThemedText color="fgSurfaceMuted" typography="bodyMd">
            {item.label}
          </ThemedText>
          <ThemedText style={styles.value(isBlurred)} typography="bodyLg">
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
