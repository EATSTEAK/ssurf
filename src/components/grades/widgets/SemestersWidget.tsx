import { GradeSummary } from '@rusaint/react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CardView } from '@/components/containers/CardView';
import { AttributesView } from '@/components/grades/ui/AttributesView';
import { ThemedText } from '@/components/primitives/ThemedText';
import { semesterToString } from '@/utils/semester';

interface SemesterGrade {
  gradePointsAverage: number;
  semester: number;
  year: number;
}

interface SemestersWidgetProps {
  certiSummary: GradeSummary;
  recordedSummary: GradeSummary;
  semesters: SemesterGrade[];
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    gap: theme.gap(2),
  },
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

export function SemestersWidget({
  certiSummary,
  recordedSummary,
  semesters,
}: SemestersWidgetProps) {
  return (
    <View style={styles.container}>
      <CardView>
        <ThemedText typography="headingLg">전체 학기 (학적부)</ThemedText>
        <AttributesView
          items={[
            { label: '신청학점', value: recordedSummary.attemptedCredits },
            { label: '취득학점', value: recordedSummary.earnedCredits },
            {
              label: '평점계',
              value: Math.round(recordedSummary.gradePointsSum * 1000) / 1000,
            },
            {
              label: '평점평균',
              value: Math.round(recordedSummary.gradePointsAverage * 1000) / 1000,
            },
            { label: '산술평균', value: recordedSummary.arithmeticMean },
            { label: 'P/F학점', value: recordedSummary.pfEarnedCredits },
          ]}
        />
      </CardView>
      <CardView>
        <ThemedText typography="headingLg">전체 학기 (증명)</ThemedText>
        <AttributesView
          items={[
            { label: '수강 학점', value: certiSummary.attemptedCredits },
            { label: '취득 학점', value: certiSummary.earnedCredits },
            { label: '평점계', value: Math.round(certiSummary.gradePointsSum * 1000) / 1000 },
            { label: '평점평균', value: Math.round(certiSummary.gradePointsAverage * 1000) / 1000 },
            { label: '산술평균', value: certiSummary.arithmeticMean },
            { label: 'P/F학점', value: certiSummary.pfEarnedCredits },
          ]}
        />
      </CardView>
      <CardView>
        <ThemedText typography="headingLg">학기별 성적</ThemedText>
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
    </View>
  );
}
