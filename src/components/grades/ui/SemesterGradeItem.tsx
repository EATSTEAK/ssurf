import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';
import { semesterToString } from '@/utils/semester';

interface SemesterGradeItemProps {
  gradePointsAverage: number;
  semester: number;
  year: number;
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

export function SemesterGradeItem({ year, semester, gradePointsAverage }: SemesterGradeItemProps) {
  return (
    <View style={styles.container}>
      <ThemedText typography="headingMd">{semesterToString({ year, semester })}</ThemedText>
      <ThemedText typography="bodyLg">
        평점 평균:{' '}
        <ThemedText style={styles.valueText} typography="bodyLg">
          {Math.round(gradePointsAverage * 1000) / 1000}
        </ThemedText>
      </ThemedText>
    </View>
  );
}
