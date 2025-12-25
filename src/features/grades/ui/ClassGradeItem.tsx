import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ClassGradeEntity } from '@/entities/grades/model';
import { useBlurGrade } from '@/features/grades/providers/BlurGradeProvider';
import { Chip } from '@/shared/ui/primitives/Chip';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.5),
    justifyContent: 'space-between',
  },
  contentView: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 1,
    gap: theme.gap(0.5),
  },
  nameView: {
    alignItems: 'center',
    columnGap: theme.gap(0.25),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeView: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    width: 48,
  },
  rank: (rank: string, isBlurred: boolean) => ({
    color:
      rank === NOT_AVAILABLE
        ? theme.colors.fgSurfaceMuted
        : rank[0] === 'P' || rank[0] === 'A'
          ? theme.colors.primaryInverted
          : rank[0] === 'B'
            ? theme.colors.secondaryInverted
            : theme.colors.errorInverted,
    fontWeight: '600',
    opacity: isBlurred ? 0.1 : 1,
  }),
  score: (isBlurred: boolean) => ({
    opacity: isBlurred ? 0.1 : 1,
  }),
}));

const rankToRating = (rank: string) => {
  switch (rank) {
    case 'A0':
      return '4.3';
    case 'A+':
      return '4.5';
    case 'A-':
      return '4.0';
    case 'B0':
      return '3.3';
    case 'B+':
      return '3.5';
    case 'B-':
      return '3.0';
    case 'C0':
      return '2.3';
    case 'C+':
      return '2.5';
    case 'C-':
      return '2.0';
    case 'D0':
      return '1.3';
    case 'D+':
      return '1.5';
    case 'D-':
      return '1.0';
    case 'F':
      return '0.0';
    default:
      return '-';
  }
};

const NOT_AVAILABLE = '성적 미입력';

export function ClassGradeItem({
  className,
  gradePoints,
  professor,
  rank,
  scoreValue,
}: ClassGradeEntity) {
  const { isBlurred } = useBlurGrade();

  return (
    <View style={styles.container}>
      <View style={styles.contentView}>
        <View style={styles.nameView}>
          <ThemedText typography="headingMd">{className}</ThemedText>
          {professor ? <ThemedText typography="labelMd">/ {professor}</ThemedText> : null}
        </View>
        <View style={styles.nameView}>
          <ThemedText color="fgSurfaceMuted" typography="bodySm">
            {gradePoints.toFixed(1)}학점
          </ThemedText>
          {rank === '' && (
            <Chip backgroundColor="errorContainer" color="fgErrorContainer">
              강의평가 미수행
            </Chip>
          )}
        </View>
      </View>
      <View style={styles.gradeView}>
        <ThemedText style={styles.rank(rank, isBlurred)} typography="headingLg">
          {rank === NOT_AVAILABLE ? '-' : rank === '' ? '*' : rank}
        </ThemedText>
        <ThemedText style={styles.score(isBlurred)}>
          {rankToRating(rank)}
          {scoreValue !== null && ` / ${scoreValue}`}
        </ThemedText>
      </View>
    </View>
  );
}
