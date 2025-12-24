import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ClassGradeDto } from '@/db/schema/grades';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(0.5),
    flexShrink: 1,
  },
  nameView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.gap(0.25),
    flexWrap: 'wrap',
  },
  gradeView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 48,
    flexShrink: 0,
  },
  rank: (rank: string) => ({
    fontWeight: '600',
    color:
      rank === NOT_AVAILABLE
        ? theme.colors.fgSurfaceMuted
        : rank[0] === 'P' || rank[0] === 'A'
          ? theme.colors.primaryInverted
          : rank[0] === 'B'
            ? theme.colors.secondaryInverted
            : theme.colors.errorInverted,
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

export function ClassGradeItem({ className, gradePoints, rank, professor }: ClassGradeDto) {
  return (
    <View style={styles.container}>
      <View style={styles.contentView}>
        <View style={styles.nameView}>
          <ThemedText typography="headingMd">{className}</ThemedText>
          {professor ? <ThemedText typography="labelMd">/ {professor}</ThemedText> : null}
        </View>
        <ThemedText color="fgSurfaceMuted" typography="bodySm">
          {gradePoints.toFixed(1)}학점
        </ThemedText>
      </View>
      <View style={styles.gradeView}>
        <ThemedText style={styles.rank(rank)} typography="headingLg">
          {rank === NOT_AVAILABLE ? '-' : rank}
        </ThemedText>
        <ThemedText>{rankToRating(rank)}</ThemedText>
      </View>
    </View>
  );
}
