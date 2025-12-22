import { GradeSummary } from '@rusaint/react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CardView } from '@/components/containers/CardView';
import { AttributesView } from '@/components/grades/ui/AttributesView';
import { SemesterGradeItem } from '@/components/grades/ui/SemesterGradeItem';
import { ThemedText } from '@/components/primitives/ThemedText';

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
            {
              label: '취득 / 신청 학점 (P/F 학점)',
              value: `${recordedSummary.earnedCredits} / ${recordedSummary.attemptedCredits} (${recordedSummary.pfEarnedCredits})`,
            },
            {
              label: '평점평균',
              value: `${Math.round(recordedSummary.gradePointsAverage * 1000) / 1000} / 4.5`,
            },
            {
              label: '산술평균',
              value: `${Math.round(recordedSummary.arithmeticMean * 1000) / 1000} / 100`,
            },
            {
              label: '평점계',
              value: Math.round(recordedSummary.gradePointsSum * 1000) / 1000,
            },
          ]}
        />
      </CardView>
      <CardView>
        <ThemedText typography="headingLg">전체 학기 (증명)</ThemedText>
        <AttributesView
          items={[
            {
              label: '취득/신청 학점 (P/F 학점)',
              value: `${certiSummary.earnedCredits} / ${certiSummary.attemptedCredits} (${certiSummary.pfEarnedCredits})`,
            },
            {
              label: '평점평균',
              value: `${Math.round(certiSummary.gradePointsAverage * 1000) / 1000} / 4.5`,
            },
            {
              label: '산술평균',
              value: `${Math.round(certiSummary.arithmeticMean * 1000) / 1000} / 100`,
            },
            { label: '평점계', value: Math.round(certiSummary.gradePointsSum * 1000) / 1000 },
          ]}
        />
      </CardView>
      <CardView>
        <ThemedText typography="headingLg">학기별 성적</ThemedText>
        {semesters?.map((semester) => (
          <View key={`${semester.year}-${semester.semester}`} style={{ marginTop: 16 }}>
            <SemesterGradeItem
              gradePointsAverage={semester.gradePointsAverage}
              semester={semester.semester}
              year={semester.year}
            />
          </View>
        ))}
      </CardView>
    </View>
  );
}
