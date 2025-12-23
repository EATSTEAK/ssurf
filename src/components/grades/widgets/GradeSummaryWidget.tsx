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
      <ThemedText color="primaryInverted" typography="heading3xl">
        {summary.gradePointsAverage.toFixed(2)}
        <ThemedText color="fgSurfaceMuted" typography="labelLg">
          {' '}
          / 4.50
        </ThemedText>
      </ThemedText>
      <ThemedText typography="bodyMd">
        {summary.earnedCredits.toFixed(1)} / {summary.attemptedCredits.toFixed(1)} 학점 취득
      </ThemedText>
    </View>
  );
}
