import type { ReactNode } from 'react';

import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CardView } from '@/shared/ui/containers/CardView';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
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
  <CardView>
    <ThemedText typography="headingLg">{title}</ThemedText>
    {children}
  </CardView>
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
