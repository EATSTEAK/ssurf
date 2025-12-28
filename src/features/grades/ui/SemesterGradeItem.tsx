import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { SemesterGradeEntity } from '@/entities/grades/model';
import { useBlurGrade } from '@/features/grades/providers/BlurGradeProvider';
import { semesterToString } from '@/shared/lib/semester';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(0.5),
  },
  attributesView: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.25),
    justifyContent: 'space-between',
  },
  attributeView: {
    width: '33%',
  },
  valueText: (isBlurred: boolean) => ({
    fontWeight: '600',
    opacity: isBlurred ? 0.1 : 1,
  }),
}));

export function SemesterGradeItem({
  attemptedCredits,
  earnedCredits,
  gradePointsAverage,
  semester,
  semesterRankFirst,
  semesterRankSecond,
  year,
}: SemesterGradeEntity) {
  const { isBlurred } = useBlurGrade();

  return (
    <View style={styles.container}>
      <ThemedText typography="headingMd">{semesterToString({ semester, year })}</ThemedText>
      <View style={styles.attributesView}>
        <View style={styles.attributeView}>
          <ThemedText color="fgSurfaceMuted" typography="labelSm">
            평점평균
          </ThemedText>
          <ThemedText style={styles.valueText(isBlurred)} typography="bodyLg">
            {gradePointsAverage.toFixed(2)}
            <ThemedText color="fgSurfaceMuted" typography="bodySm">
              {' '}
              / 4.50
            </ThemedText>
          </ThemedText>
        </View>
        <View style={styles.attributeView}>
          <ThemedText color="fgSurfaceMuted" typography="labelSm">
            취득/신청학점
          </ThemedText>
          <ThemedText style={styles.valueText(isBlurred)} typography="bodyLg">
            {earnedCredits.toFixed(2)}
            <ThemedText color="fgSurfaceMuted" typography="bodySm">
              {' '}
              / {attemptedCredits.toFixed(2)}
            </ThemedText>
          </ThemedText>
        </View>
        <View style={styles.attributeView}>
          <ThemedText color="fgSurfaceMuted" typography="labelSm">
            학기별 석차
          </ThemedText>
          <ThemedText style={styles.valueText(isBlurred)} typography="bodyLg">
            {semesterRankFirst}
            <ThemedText color="fgSurfaceMuted" typography="bodySm">
              {' '}
              / {semesterRankSecond}
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
