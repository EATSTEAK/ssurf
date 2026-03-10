import { PixelRatio, Pressable, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CourseScheduleEntity } from '@/entities/courseSchedule/model';
import { getCourseColor, HOUR_HEIGHT } from '@/features/schedule/lib/utils';

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
  const top = PixelRatio.roundToNearestPixel(
    ((item.startTime - startHour * 60) / 60) * HOUR_HEIGHT,
  );
  const height = PixelRatio.roundToNearestPixel(
    ((item.endTime - item.startTime) / 60) * HOUR_HEIGHT,
  );
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
        <Text style={[styles.classroom, { color: color.fg }]}>
          {item.classroom}
        </Text>
      )}
    </Pressable>
  );
};
