import { PixelRatio, Pressable, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CourseScheduleEntity } from '@/entities/courseSchedule/model';
import { getCourseColor, HOUR_HEIGHT, parseTimeRange } from '@/features/schedule/lib/utils';

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Pretendard',
  },
  classroom: {
    fontSize: 10,
    fontWeight: '400',
    fontFamily: 'Pretendard',
    marginTop: 1,
  },
});

interface ScheduleCellProps {
  isDark: boolean;
  item: CourseScheduleEntity;
  onPress: (item: CourseScheduleEntity) => void;
  startHour: number;
}

export const ScheduleCell = ({ item, startHour, onPress, isDark }: ScheduleCellProps) => {
  const { startMinutes, endMinutes } = parseTimeRange(item.time);
  const top = PixelRatio.roundToNearestPixel(
    ((startMinutes - startHour * 60) / 60) * HOUR_HEIGHT,
  );
  const height = PixelRatio.roundToNearestPixel(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT);
  const color = getCourseColor(item.name, isDark);
  const isShort = height < 40;

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={[styles.cell, { top, height, backgroundColor: color.bg }]}
    >
      <Text numberOfLines={isShort ? 1 : 2} style={[styles.name, { color: color.fg }]}>
        {item.name}
      </Text>
      {!isShort && (
        <Text numberOfLines={1} style={[styles.classroom, { color: color.fg }]}>
          {item.classroom}
        </Text>
      )}
    </Pressable>
  );
};
