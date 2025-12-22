import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';
import { semesterToString } from '@/utils/semester';

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(2),
  },
}));

interface SemesterWidgetProps {
  semester: {
    gradePointsAverage: number;
    semester: number;
    year: number;
  };
}

export function SemesterWidget({ semester }: SemesterWidgetProps) {
  return (
    <View style={styles.container}>
      <ThemedText typography="headingLg">
        {semesterToString({
          year: semester.year,
          semester: semester.semester,
        })}
      </ThemedText>
      <ThemedText typography="bodyLg">
        평점 평균:{' '}
        <ThemedText style={{ fontWeight: 600 }} typography="bodyLg">
          {Math.round(semester.gradePointsAverage * 1000) / 1000}
        </ThemedText>
      </ThemedText>
    </View>
  );
}
