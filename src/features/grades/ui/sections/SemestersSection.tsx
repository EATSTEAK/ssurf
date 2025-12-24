import { GradeSummary } from '@rusaint/react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { SemesterGradeModel } from '@/entities/grades/model/grades';
import { AttributesView } from '@/features/grades/ui/AttributesView';
import { SemesterGradeItem } from '@/features/grades/ui/SemesterGradeItem';
import { CardView } from '@/shared/ui/containers/CardView';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

interface SemestersWidgetProps {
  certiSummary: GradeSummary;
  recordedSummary: GradeSummary;
  semesters: SemesterGradeModel[];
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
              value: `${recordedSummary.earnedCredits.toFixed(1)} / ${recordedSummary.attemptedCredits.toFixed(1)} (${recordedSummary.pfEarnedCredits.toFixed(1)})`,
            },
            {
              label: '평점평균',
              value: `${recordedSummary.gradePointsAverage.toFixed(2)} / 4.50`,
            },
            {
              label: '산술평균',
              value: `${recordedSummary.arithmeticMean.toFixed(1)} / 100`,
            },
            {
              label: '평점계',
              value: recordedSummary.gradePointsSum.toFixed(1),
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
              value: `${certiSummary.gradePointsAverage.toFixed(2)} / 4.50`,
            },
            {
              label: '산술평균',
              value: `${certiSummary.arithmeticMean.toFixed(1)} / 100`,
            },
            { label: '평점계', value: certiSummary.gradePointsSum.toFixed(1) },
          ]}
        />
      </CardView>
      <CardView>
        <ThemedText typography="headingLg">학기별 성적</ThemedText>
        {semesters?.map((semester) => (
          <View key={`${semester.year}-${semester.semester}`}>
            <SemesterGradeItem {...semester} />
          </View>
        ))}
      </CardView>
    </View>
  );
}
