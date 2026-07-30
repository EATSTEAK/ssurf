import type { ReactNode } from 'react';

import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  section: {
    backgroundColor: theme.colors.surfaceDim,
    borderCurve: 'continuous',
    borderRadius: theme.cornerRadius.md,
    gap: theme.gap(2),
    padding: theme.gap(2),
  },
  row: {
    gap: theme.gap(0.5),
  },
}));

export const CourseDetailSection = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <View style={styles.section}>
    <ThemedText typography="headingLg">{title}</ThemedText>
    {children}
  </View>
);

export const CourseDetailRow = ({ label, value }: { label: string; value?: null | string }) => {
  if (!value?.trim()) {
    return null;
  }

  return (
    <View style={styles.row}>
      <ThemedText color="fgSurfaceDim" typography="labelMd">
        {label}
      </ThemedText>
      <ThemedText selectable typography="bodyLg">
        {value}
      </ThemedText>
    </View>
  );
};
