import { View } from 'react-native';

import { ThemedText } from '@/components/primitives/ThemedText';

interface GradeSummary {
  arithmeticMean: number;
  attemptedCredits: number;
  earnedCredits: number;
  gradePointsAverage: number;
  gradePointsSum: number;
}

interface GradeSummaryWidgetProps {
  summary: GradeSummary;
}

export function GradeSummaryWidget({ summary }: GradeSummaryWidgetProps) {
  return (
    <View>
      <ThemedText typography="headingLg">평점 평균</ThemedText>
      <ThemedText typography="heading3xl">
        {Math.round(summary.gradePointsAverage * 1000) / 1000}
      </ThemedText>
      <ThemedText typography="bodyLg">
        {summary.earnedCredits} / {summary.attemptedCredits} 학점 수강
      </ThemedText>

      <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <ThemedText style={{ fontWeight: 600 }} typography="labelLg">
            산술평균
          </ThemedText>
          <ThemedText typography="bodyLg">{summary.arithmeticMean}</ThemedText>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <ThemedText style={{ fontWeight: 600 }} typography="labelLg">
            평점계
          </ThemedText>
          <ThemedText typography="bodyLg">
            {Math.round(summary.gradePointsSum * 1000) / 1000}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
