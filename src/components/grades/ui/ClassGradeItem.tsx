import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';

interface ClassGradeItemProps {
  className: string;
  gradePoints: number;
  professor: string;
  rank: string;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    gap: theme.gap(0.5),
  },
  valueText: {
    fontWeight: '600',
  },
}));

export function ClassGradeItem({ className, gradePoints, rank, professor }: ClassGradeItemProps) {
  return (
    <View style={styles.container}>
      <ThemedText typography="headingMd">{className}</ThemedText>
      <ThemedText typography="bodyLg">
        학점:{' '}
        <ThemedText style={styles.valueText} typography="bodyLg">
          {gradePoints}
        </ThemedText>
      </ThemedText>
      <ThemedText typography="bodyLg">
        등급:{' '}
        <ThemedText style={styles.valueText} typography="bodyLg">
          {rank}
        </ThemedText>
      </ThemedText>
      <ThemedText typography="bodyLg">교수: {professor}</ThemedText>
    </View>
  );
}
