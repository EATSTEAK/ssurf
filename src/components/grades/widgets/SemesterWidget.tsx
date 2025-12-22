import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CardView } from '@/components/containers/CardView';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useClassGrades } from '@/hooks/grades/grades';
import { semesterToString } from '@/utils/semester';

interface SemesterWidgetProps {
  semester: {
    gradePointsAverage: number;
    semester: number;
    year: number;
  };
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    gap: theme.gap(2),
  },
}));

export function SemesterWidget({ semester }: SemesterWidgetProps) {
  const { data: classGrades } = useClassGrades(semester.year, semester.semester);

  return (
    <View style={styles.container}>
      <CardView>
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
      </CardView>
      <CardView>
        <ThemedText typography="headingLg">과목별 성적</ThemedText>
        {classGrades?.map((classGrade) => (
          <View key={classGrade.code} style={{ marginTop: 16, gap: 4 }}>
            <ThemedText typography="headingMd">{classGrade.className}</ThemedText>
            <ThemedText typography="bodyLg">
              학점:{' '}
              <ThemedText style={{ fontWeight: 600 }} typography="bodyLg">
                {classGrade.gradePoints}
              </ThemedText>
            </ThemedText>
            <ThemedText typography="bodyLg">
              등급:{' '}
              <ThemedText style={{ fontWeight: 600 }} typography="bodyLg">
                {classGrade.rank}
              </ThemedText>
            </ThemedText>
            <ThemedText typography="bodyLg">교수: {classGrade.professor}</ThemedText>
          </View>
        ))}
      </CardView>
    </View>
  );
}
