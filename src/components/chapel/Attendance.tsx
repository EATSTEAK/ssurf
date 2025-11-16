import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
  chip: {
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
    borderRadius: theme.cornerRadius.md,
    paddingVertical: theme.gap(0.5),
    paddingHorizontal: theme.gap(1),
    alignSelf: 'flex-end',
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
        <View style={{ flexGrow: 1 }}>
          <ThemedText color="fgSuccessContainer" style={styles.chip} typography="labelMd">
            {attendance.date} / {attendance.attendance || '미결'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};
