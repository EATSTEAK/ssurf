import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';
import { ChapelAttendanceDto } from '@/db/schema/chapel';

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 10,
    backgroundColor: theme.colors.surfaceDim,
    display: 'flex',
    gap: theme.gap(2),
    width: '100%',
  },
}));

export const Attendance = ({ attendance }: { attendance: ChapelAttendanceDto }) => {
  return (
    <View key={attendance.date} style={styles.container}>
      <ThemedText color="fgSurfaceDim" typography="headingMd">
        {attendance.category} (
        {`${attendance.instructor} ${attendance.instructorDepartment}`.trim()})
      </ThemedText>
      <ThemedText color="fgSurfaceDim" style={{ alignSelf: 'flex-end' }}>
        {attendance.date} / {attendance.attendance || '미결'}
      </ThemedText>
    </View>
  );
};
