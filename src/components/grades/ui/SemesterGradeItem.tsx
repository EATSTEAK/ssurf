import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';
import { SemesterGradeDto } from '@/db/schema/grades';
import { semesterToString } from '@/utils/semester';

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
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
  valueText: {
    fontWeight: '600',
  },
}));

export function SemesterGradeItem({
  year,
  semester,
  gradePointsAverage,
  earnedCredits,
  attemptedCredits,
  semesterRankFirst,
  semesterRankSecond,
}: SemesterGradeDto) {
  return (
    <View style={styles.container}>
      <ThemedText typography="headingMd">{semesterToString({ year, semester })}</ThemedText>
      <View style={styles.attributesView}>
        <View style={styles.attributeView}>
          <ThemedText color="fgSurfaceMuted" typography="labelSm">
            평점평균
          </ThemedText>
          <ThemedText style={styles.valueText} typography="bodyLg">
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
          <ThemedText style={styles.valueText} typography="bodyLg">
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
          <ThemedText style={styles.valueText} typography="bodyLg">
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
