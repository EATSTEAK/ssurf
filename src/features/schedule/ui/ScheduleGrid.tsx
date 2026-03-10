import { useState } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CourseScheduleEntity } from '@/entities/courseSchedule/model';
import {
  assignCourseColorIndices,
  getGridBounds,
  HOUR_HEIGHT,
  WEEKDAY_LABELS,
} from '@/features/schedule/lib/utils';
import { ScheduleCell } from '@/features/schedule/ui/ScheduleCell';
import { ScheduleDetailModal } from '@/features/schedule/ui/ScheduleDetailModal';

const TIME_LABEL_WIDTH = 40;
const COLOR_SIZE = 8;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: TIME_LABEL_WIDTH,
  },
  timeLabel: {
    height: HOUR_HEIGHT,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 2,
  },
  timeLabelText: {
    fontSize: 10,
    fontFamily: 'Pretendard',
    fontWeight: '400',
    color: theme.colors.fgSurfaceMuted,
  },
  dayColumnsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  dayColumn: {
    flex: 1,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    marginLeft: TIME_LABEL_WIDTH,
    marginBottom: 4,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerText: {
    fontSize: 12,
    fontFamily: 'Pretendard',
    fontWeight: '500',
    color: theme.colors.fgSurfaceDim,
  },
  gridLine: {
    height: HOUR_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceDimmer,
  },
}));

interface ScheduleGridProps {
  data: CourseScheduleEntity[];
}

export const ScheduleGrid = ({ data }: ScheduleGridProps) => {
  const { startHour, endHour, weekdays } = getGridBounds(data);
  const totalHours = endHour - startHour;
  const [selectedItem, setSelectedItem] = useState<CourseScheduleEntity | null>(null);

  const displayWeekdays = weekdays.length > 0 ? weekdays : [0, 1, 2, 3, 4];

  const hours = Array.from({ length: totalHours }, (_, i) => startHour + i);

  const colorIndices = assignCourseColorIndices(data, COLOR_SIZE);
  const colorIndexMap = new Map<CourseScheduleEntity, number>();
  data.forEach((item, i) => colorIndexMap.set(item, colorIndices[i]));

  const coursesByDay = new Map<number, CourseScheduleEntity[]>();
  for (const item of data) {
    const existing = coursesByDay.get(item.weekday) ?? [];
    existing.push(item);
    coursesByDay.set(item.weekday, existing);
  }

  return (
    <View>
      <View style={styles.headerRow}>
        {displayWeekdays.map((day) => (
          <View key={day} style={styles.headerCell}>
            <Text style={styles.headerText}>{WEEKDAY_LABELS[day]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.container}>
        <View style={styles.timeColumn}>
          {hours.map((hour) => (
            <View key={hour} style={styles.timeLabel}>
              <Text style={styles.timeLabelText}>{hour}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dayColumnsContainer}>
          {displayWeekdays.map((day) => (
            <View key={day} style={styles.dayColumn}>
              {hours.map((hour) => (
                <View key={hour} style={styles.gridLine} />
              ))}
              {(coursesByDay.get(day) ?? []).map((item) => (
                <ScheduleCell
                  colorIndex={colorIndexMap.get(item)!}
                  item={item}
                  key={`${item.name}-${item.startTime}`}
                  onPress={setSelectedItem}
                  startHour={startHour}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <ScheduleDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        visible={selectedItem !== null}
      />
    </View>
  );
};
