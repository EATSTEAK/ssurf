import { View } from 'react-native';

import { CardView } from '@/components/containers/CardView';
import { ThemedText } from '@/components/primitives/ThemedText';
import { semesterToString } from '@/utils/semester';

interface SemesterGrade {
  gradePointsAverage: number;
  semester: number;
  year: number;
}

interface SemestersWidgetProps {
  semesters: SemesterGrade[];
}

export function SemestersWidget({ semesters }: SemestersWidgetProps) {
  return (
    <CardView>
      <ThemedText typography="headingLg">학기별 정보</ThemedText>
      {semesters?.map((semester) => (
        <View key={`${semester.year}-${semester.semester}`} style={{ marginTop: 16, gap: 4 }}>
          <ThemedText typography="headingMd">
            {semesterToString({ year: semester.year, semester: semester.semester })}
          </ThemedText>
          <ThemedText typography="bodyLg">
            평점 평균:{' '}
            <ThemedText style={{ fontWeight: 600 }} typography="bodyLg">
              {Math.round(semester.gradePointsAverage * 1000) / 1000}
            </ThemedText>
          </ThemedText>
        </View>
      ))}
    </CardView>
  );
}
