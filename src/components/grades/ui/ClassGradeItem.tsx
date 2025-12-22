import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';
import { ClassGradeDto } from '@/db/schema/grades';

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(0.25),
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  gradeView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 48,
    flexShrink: 0,
  },
}));

const NOT_AVAILABLE = '성적 미입력';

export function ClassGradeItem({ className, gradePoints, rank, professor }: ClassGradeDto) {
  return (
    <View style={styles.container}>
      <View style={styles.nameView}>
        <ThemedText typography="headingMd">{className}</ThemedText>
        {professor ? <ThemedText typography="labelMd">/ {professor}</ThemedText> : null}
      </View>
      <View style={styles.gradeView}>
        <ThemedText typography="headingLg">{rank === NOT_AVAILABLE ? '-' : rank}</ThemedText>
        <ThemedText>{gradePoints}</ThemedText>
      </View>
    </View>
  );
}
