import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Chip } from '@/components/primitives/Chip';
import { ThemedText } from '@/components/primitives/ThemedText';
import { ChapelAttendanceDto } from '@/db/schema/chapel';

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surfaceDim,
    paddingVertical: theme.gap(0.5),
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: theme.gap(1),
  },
  categoryContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: theme.gap(1),
    flexWrap: 'wrap',
  },
  chipVariant: {
    variants: {
      attendance: {
        attended: {
          backgroundColor: theme.colors.success,
        },
        absent: {
          backgroundColor: theme.colors.error,
        },
        pending: {
          backgroundColor: theme.colors.surfaceDimmer,
        },
      },
    },
  },
}));

export const Attendance = ({ attendance }: { attendance: ChapelAttendanceDto }) => {
  styles.useVariants({
    attendance:
      attendance.attendance === '출석'
        ? 'attended'
        : attendance.attendance === '결석'
          ? 'absent'
          : 'pending',
  });
  return (
    <View key={attendance.date} style={styles.container}>
      <View style={styles.categoryContainer}>
        <View>
          <ThemedText color="fgSurfaceDim" typography="labelMd">
            {attendance.category}
          </ThemedText>
          <ThemedText color="fgSurfaceDim" typography="headingMd">
            {`${attendance.instructor} ${attendance.instructorDepartment}`.trim()}
          </ThemedText>
        </View>
        <View style={{ flexGrow: 1, alignItems: 'flex-end' }}>
          <Chip style={styles.chipVariant}>
            {attendance.date} / {attendance.attendance || '미결'}
          </Chip>
        </View>
      </View>
    </View>
  );
};
