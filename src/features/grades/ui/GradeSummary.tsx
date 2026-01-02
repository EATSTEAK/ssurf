import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useBlurGrade } from '@/features/grades/providers/BlurGradeProvider';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

interface GradeSummaryProps {
  isSemesterSummary: boolean;
  summary: {
    attemptedCredits: number;
    earnedCredits: number;
    gradePointsAverage: number;
  };
}

const styles = StyleSheet.create(() => ({
  value: (isBlurred: boolean) => ({
    opacity: isBlurred ? 0.1 : 1,
  }),
}));

export function GradeSummary({ summary, isSemesterSummary = false }: GradeSummaryProps) {
  const { isBlurred } = useBlurGrade();

  return (
    <View>
      <ThemedText typography="headingMd">
        평점 평균{' '}
        <ThemedText color="fgSurfaceMuted" typography="labelSm">
          {isSemesterSummary ? '(학기)' : '(전체)'}
        </ThemedText>
      </ThemedText>
      <ThemedText color="primaryInverted" style={styles.value(isBlurred)} typography="heading3xl">
        {summary.gradePointsAverage.toFixed(2)}
        <ThemedText color="fgSurfaceMuted" typography="labelLg">
          {' '}
          / 4.50
        </ThemedText>
      </ThemedText>
      <ThemedText style={styles.value(isBlurred)} typography="bodyMd">
        {summary.earnedCredits.toFixed(1)} / {summary.attemptedCredits.toFixed(1)} 학점 취득
      </ThemedText>
    </View>
  );
}
