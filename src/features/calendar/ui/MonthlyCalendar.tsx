import { addMonths, format } from 'date-fns';
import { Pressable, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { getMonthDateKey, parseCalendarDateKey } from '@/features/calendar/lib/isTodayCalendar';
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/ui/icons';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

export type CalendarPeriod = {
  color: string;
  endingDay?: boolean;
  startingDay?: boolean;
};

export type CalendarMarking = {
  color?: string;
  endingDay?: boolean;
  periods?: CalendarPeriod[];
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
  startingDay?: boolean;
  textColor?: string;
};

type MonthlyCalendarProps = {
  markedDates: Record<string, CalendarMarking>;
  onMonthChange: (dateString: string) => void;
  onSelectDate: (dateString: string) => void;
  visibleMonth: string;
};

LocaleConfig.locales.kr = {
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(1),
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.gap(1.5),
  },
  monthLabel: {
    flex: 1,
  },
  navButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(0.5),
  },
  navButton: {
    alignItems: 'center',
    borderRadius: theme.cornerRadius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  calendar: {
    borderRadius: theme.cornerRadius.md,
    overflow: 'hidden',
  },
}));

export function MonthlyCalendar({
  markedDates,
  visibleMonth,
  onMonthChange,
  onSelectDate,
}: MonthlyCalendarProps) {
  const { theme } = useUnistyles();
  const monthLabel = format(parseCalendarDateKey(visibleMonth), 'yyyy년 M월');
  const handlePressPrevMonth = () => {
    onMonthChange(getMonthDateKey(addMonths(parseCalendarDateKey(visibleMonth), -1)));
  };
  const handlePressNextMonth = () => {
    onMonthChange(getMonthDateKey(addMonths(parseCalendarDateKey(visibleMonth), 1)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthLabel}>
          <ThemedText typography="headingLg">{monthLabel}</ThemedText>
        </View>
        <View style={styles.navButtons}>
          <Pressable onPress={handlePressPrevMonth} style={styles.navButton}>
            <ChevronLeftIcon color={theme.colorsHex.fgSurface} size={20} />
          </Pressable>
          <Pressable onPress={handlePressNextMonth} style={styles.navButton}>
            <ChevronRightIcon color={theme.colorsHex.fgSurface} size={20} />
          </Pressable>
        </View>
      </View>
      <Calendar
        current={visibleMonth}
        enableSwipeMonths
        firstDay={1}
        hideArrows={true}
        hideExtraDays={false}
        markedDates={markedDates}
        markingType="multi-period"
        onDayPress={(day) => onSelectDate(day.dateString)}
        onMonthChange={(month) => onMonthChange(month.dateString)}
        renderHeader={() => null}
        style={styles.calendar}
        theme={{
          arrowColor: theme.colors.fgSurface,
          backgroundColor: theme.colors.surface,
          calendarBackground: theme.colors.surface,
          dayTextColor: theme.colors.fgSurface,
          monthTextColor: theme.colors.fgSurface,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.fgPrimary,
          textDisabledColor: theme.colors.fgSecondary,
          textMonthFontFamily: 'Pretendard',
          textMonthFontSize: 18,
          textMonthFontWeight: '700',
          textSectionTitleColor: theme.colors.fgSecondary,
          todayTextColor: theme.colors.primary,
        }}
      />
    </View>
  );
}
