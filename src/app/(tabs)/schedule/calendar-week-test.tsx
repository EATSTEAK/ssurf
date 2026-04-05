import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  getCalendarDateKey,
  getMonthDateKey,
  parseCalendarDateKey,
} from '@/features/calendar/lib/isTodayCalendar';
import { type CalendarMarking } from '@/features/calendar/ui/MonthlyCalendar';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { Header } from '@/shared/ui/headers/Header';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    backgroundColor: theme.colors.surface,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: theme.gap(3),
    padding: theme.gap(3),
    width: '100%',
  },
  calendarWrapper: {
    flex: 1,
    width: '100%',
  },
  infoBox: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.cornerRadius.md,
    gap: theme.gap(1),
    padding: theme.gap(2),
  },
}));

export default function CalendarWeekTestScreen() {
  const { theme } = useUnistyles();
  const today = useMemo(() => new Date(), []);
  const initialDate = useMemo(() => getCalendarDateKey(today), [today]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(getMonthDateKey(today));

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setVisibleMonth(getMonthDateKey(parseCalendarDateKey(dateString)));
  };

  const markedDates = useMemo<Record<string, CalendarMarking>>(
    () => ({
      [selectedDate]: {
        selected: true,
        selectedColor: '#5B8DEF',
        selectedTextColor: '#FFFFFF',
      },
    }),
    [selectedDate],
  );

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, headerTransparent: true, title: 'WeekCalendar Test' }}
      />
      <View style={styles.root}>
        <SafeContainer edges={['top']}>
          <View style={styles.content}>
            <Header title="WeekCalendar Test" />
            <View style={styles.infoBox}>
              <ThemedText typography="labelMd">selectedDate: {selectedDate}</ThemedText>
              <ThemedText typography="labelMd">visibleMonth: {visibleMonth}</ThemedText>
              <ThemedText color="fgSecondary" typography="bodySm">
                좌우 스와이프로 주간 전환 시 오류가 재현되는지 확인하는 독립 페이지입니다.
              </ThemedText>
            </View>
            <View style={styles.calendarWrapper}>
              <CalendarProvider date={selectedDate} onDateChanged={handleSelectDate}>
                <WeekCalendar
                  allowShadow={false}
                  calendarHeight={82}
                  current={selectedDate}
                  firstDay={1}
                  hideDayNames={false}
                  markedDates={markedDates}
                  markingType="multi-period"
                  onDayPress={(day) => handleSelectDate(day.dateString)}
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
              </CalendarProvider>
            </View>
          </View>
        </SafeContainer>
      </View>
    </>
  );
}
