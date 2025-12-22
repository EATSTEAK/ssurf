import { View } from 'react-native';

import { ThemedText } from '@/components/primitives/ThemedText';

interface GradeSummary {
  attemptedCredits: number;
  earnedCredits: number;
  gradePointsAverage: number;
}

interface GradeSummaryWidgetProps {
  summary: GradeSummary;
}

export function GradeSummaryWidget({ summary }: GradeSummaryWidgetProps) {
  return (
    <View>
      <ThemedText typography="headingMd">평점 평균</ThemedText>
      <ThemedText typography="heading3xl">
        {Math.round(summary.gradePointsAverage * 1000) / 1000}
        <ThemedText color="fgSurfaceMuted" typography="labelLg">
          {' '}
          / 4.5
        </ThemedText>
      </ThemedText>
      <ThemedText typography="bodyMd">
        {summary.earnedCredits} / {summary.attemptedCredits} 학점 취득
      </ThemedText>
    </View>
  );
}
