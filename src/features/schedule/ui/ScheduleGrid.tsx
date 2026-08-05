import type { SemesterType } from '@rusaint/react-native';

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CourseInformationEntity, CourseScheduleEntity } from '@/entities/courseSchedule/model';
import {
  assignCourseColorIndices,
  findCourseMatch,
  getGridBounds,
  HOUR_HEIGHT,
  isScheduleActive,
  WEEKDAY_LABELS,
} from '@/features/schedule/lib/utils';
import { ScheduleCell } from '@/features/schedule/ui/ScheduleCell';
import { semesterToSlug } from '@/shared/lib/semester';

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
  todayColumn: {
    borderRadius: 6,
    backgroundColor: theme.colors.errorContainer,
  },
  todayHeaderText: {
    color: theme.colors.fgErrorContainer,
    fontWeight: '700',
  },
  gridLine: {
    height: HOUR_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceDimmer,
  },
  currentTimeLine: (top: number) => ({
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top,
    height: 2,
    backgroundColor: theme.colors.error,
    zIndex: 2,
  }),
}));

interface ScheduleGridProps {
  courseInformation: CourseInformationEntity[];
  data: CourseScheduleEntity[];
  semester: SemesterType;
  year: number;
}

export const ScheduleGrid = ({ courseInformation, data, semester, year }: ScheduleGridProps) => {
  const router = useRouter();
  const { startHour, endHour, weekdays } = getGridBounds(data);
  const totalHours = endHour - startHour;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const displayWeekdays = weekdays.length > 0 ? weekdays : [0, 1, 2, 3, 4];
  const today = (now.getDay() + 6) % 7;
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const currentTimeTop = ((currentMinutes - startHour * 60) / 60) * HOUR_HEIGHT;
  const showCurrentTime = currentMinutes >= startHour * 60 && currentMinutes < endHour * 60;

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

  const handlePressCourse = (item: CourseScheduleEntity) => {
    const course = findCourseMatch(item, courseInformation);
    if (!course) {
      Alert.alert('과목 정보를 찾지 못했어요.', '잠시 후 다시 시도해주세요.');
      return;
    }

    router.push({
      pathname: '/(tabs)/schedule/course/[term]/[code]',
      params: {
        classroom: item.classroom,
        code: course.code,
        endTime: String(item.endTime),
        name: item.name,
        professor: item.professor,
        semester: String(semester),
        startTime: String(item.startTime),
        term: semesterToSlug({ semester, year }),
        weekday: String(item.weekday),
        year: String(year),
      },
    });
  };

  return (
    <View>
      <View style={styles.headerRow}>
        {displayWeekdays.map((day) => (
          <View
            key={day}
            style={[styles.headerCell, day === today ? styles.todayColumn : undefined]}
          >
            <Text style={[styles.headerText, day === today ? styles.todayHeaderText : undefined]}>
              {WEEKDAY_LABELS[day]}
            </Text>
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
            <View
              key={day}
              style={[styles.dayColumn, day === today ? styles.todayColumn : undefined]}
            >
              {hours.map((hour) => (
                <View key={hour} style={styles.gridLine} />
              ))}
              {(coursesByDay.get(day) ?? []).map((item) => (
                <ScheduleCell
                  colorIndex={colorIndexMap.get(item)!}
                  isActive={isScheduleActive(item, now)}
                  item={item}
                  key={`${item.name}-${item.startTime}`}
                  onPress={handlePressCourse}
                  startHour={startHour}
                />
              ))}
              {day === today && showCurrentTime ? (
                <View pointerEvents="none" style={styles.currentTimeLine(currentTimeTop)} />
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
