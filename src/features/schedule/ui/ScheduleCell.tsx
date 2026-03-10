import { PixelRatio, Pressable, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CourseScheduleEntity } from '@/entities/courseSchedule/model';
import { HOUR_HEIGHT } from '@/features/schedule/lib/utils';

const styles = StyleSheet.create((theme) => ({
  cell: (colorIndex: number) => ({
    position: 'absolute' as const,
    left: 2,
    right: 2,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    overflow: 'hidden' as const,
    backgroundColor: theme.schedule.courseColors[colorIndex].bg,
  }),
  text: (colorIndex: number) => ({
    color: theme.schedule.courseColors[colorIndex].fg,
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
  colorIndex: number;
  item: CourseScheduleEntity;
  onPress: (item: CourseScheduleEntity) => void;
  startHour: number;
}

export const ScheduleCell = ({ colorIndex, item, startHour, onPress }: ScheduleCellProps) => {
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
      style={[styles.cell(colorIndex), { top, height }]}
    >
      <Text numberOfLines={isShort ? 1 : 2} style={[styles.name, styles.text(colorIndex)]}>
        {item.name}
      </Text>
      {!isShort && (
        <Text style={[styles.classroom, styles.text(colorIndex)]}>
          {item.classroom}
        </Text>
      )}
    </Pressable>
  );
};
