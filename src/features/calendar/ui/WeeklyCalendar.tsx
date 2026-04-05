import type { CalendarMarking } from './MonthlyCalendar';

import { format } from 'date-fns';
import { View } from 'react-native';
import { WeekCalendar } from 'react-native-calendars';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { parseCalendarDateKey } from '@/features/calendar/lib/isTodayCalendar';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

type WeeklyCalendarProps = {
  currentDate: string;
  markedDates: Record<string, CalendarMarking>;
  onSelectDate: (dateString: string) => void;
};

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const styles = StyleSheet.create((theme) => ({
  container: {
    marginHorizontal: 0,
  },
  monthLabel: {
    paddingHorizontal: theme.gap(1.5),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingTop: theme.gap(1),
  },
  headerCell: {
    alignItems: 'center',
    flex: 1,
  },
}));

export function WeeklyCalendar({ currentDate, markedDates, onSelectDate }: WeeklyCalendarProps) {
  const { theme } = useUnistyles();
  const monthLabel = format(parseCalendarDateKey(currentDate), 'yyyy년 M월');

  return (
    <View style={styles.container}>
      <View style={styles.monthLabel}>
        <ThemedText typography="headingLg">{monthLabel}</ThemedText>
      </View>
      <View style={styles.headerRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.headerCell}>
            <ThemedText color="fgSecondary" typography="labelSm">
              {label}
            </ThemedText>
          </View>
        ))}
      </View>
      <WeekCalendar
        allowShadow={false}
        calendarHeight={82}
        current={currentDate}
        firstDay={1}
        hideDayNames
        markedDates={markedDates}
        markingType="multi-period"
        onDayPress={(day) => onSelectDate(day.dateString)}
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
