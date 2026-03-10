import { PixelRatio, Pressable, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CourseScheduleEntity } from '@/entities/courseSchedule/model';
import { getCourseColor, HOUR_HEIGHT } from '@/features/schedule/lib/utils';

type CourseColorKey = { classroom: string; startTime: number; weekday: number; };

const styles = StyleSheet.create((theme) => ({
  cell: (item: CourseColorKey) => ({
    position: 'absolute' as const,
    left: 2,
    right: 2,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    overflow: 'hidden' as const,
    backgroundColor: getCourseColor(item, theme.schedule.courseColors).bg,
  }),
  text: (item: CourseColorKey) => ({
    color: getCourseColor(item, theme.schedule.courseColors).fg,
  }),
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
}));

interface ScheduleCellProps {
  item: CourseScheduleEntity;
  onPress: (item: CourseScheduleEntity) => void;
  startHour: number;
}

export const ScheduleCell = ({ item, startHour, onPress }: ScheduleCellProps) => {
  const top = PixelRatio.roundToNearestPixel(
    ((item.startTime - startHour * 60) / 60) * HOUR_HEIGHT,
  );
  const height = PixelRatio.roundToNearestPixel(
    ((item.endTime - item.startTime) / 60) * HOUR_HEIGHT,
  );
  const isShort = height < 40;

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={[styles.cell(item), { top, height }]}
    >
      <Text numberOfLines={isShort ? 1 : 2} style={[styles.name, styles.text(item)]}>
        {item.name}
      </Text>
      {!isShort && (
        <Text style={[styles.classroom, styles.text(item)]}>
          {item.classroom}
        </Text>
      )}
    </Pressable>
  );
};
