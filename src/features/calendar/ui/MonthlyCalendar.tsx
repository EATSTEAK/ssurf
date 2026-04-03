import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { CalendarEntity } from '@/entities/calendar/model';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const MAX_PREVIEW_ITEMS = 2;

const styles = StyleSheet.create((theme) => ({
  calendar: {
    borderRadius: theme.cornerRadius.md,
    overflow: 'hidden',
  },
  container: {
    padding: theme.gap(3),
    borderRadius: theme.cornerRadius.lg,
    backgroundColor: theme.colors.surface,
    gap: theme.gap(2),
  },
  dayCell: {
    gap: 2,
    minHeight: 64,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  dayNumber: {
    textAlign: 'center',
  },
  moreText: {
    paddingHorizontal: 4,
  },
  previewText: {
    paddingHorizontal: 4,
  },
  selectedDay: {
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
  },
}));

type MonthlyCalendarProps = {
  dayItems: Record<string, CalendarEntity[]>;
  onMonthChange: (dateString: string) => void;
  onSelectDate: (dateString: string) => void;
  selectedDate: string;
  todayKey: string;
  visibleMonth: string;
};

export function MonthlyCalendar({
  dayItems,
  selectedDate,
  visibleMonth,
  onMonthChange,
  onSelectDate,
  todayKey,
}: MonthlyCalendarProps) {
  const { theme } = useUnistyles();

  const markedDates = useMemo(() => {
    return Object.entries(dayItems).reduce<
      Record<string, { marked?: boolean; selected?: boolean }>
    >(
      (acc, [key, items]) => {
        if (items.length > 0) {
          acc[key] = { marked: true };
        }
        return acc;
      },
      {
        [selectedDate]: {
          ...(dayItems[selectedDate]?.length ? { marked: true } : {}),
          selected: true,
        },
      },
    );
  }, [dayItems, selectedDate]);

  return (
    <View style={styles.container}>
      <Calendar
        current={visibleMonth}
        dayComponent={({ date, state }: { date?: DateData; state?: string }) => {
          if (!date) {
            return <View />;
          }

          const isSelected = date.dateString === selectedDate;
          const isToday = date.dateString === todayKey;
          const items = dayItems[date.dateString] ?? [];
          const previewItems = items.slice(0, MAX_PREVIEW_ITEMS);
          const remainingCount = items.length - previewItems.length;
          const isDisabled = state === 'disabled';

          return (
            <Pressable onPress={() => onSelectDate(date.dateString)}>
              <View
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                  !isSelected && isToday && styles.todayDay,
                ]}
              >
                <ThemedText
                  color={isSelected ? 'fgPrimary' : isDisabled ? 'fgSecondary' : 'fgSurface'}
                  style={styles.dayNumber}
                  typography="labelSm"
                >
                  {date.day}
                </ThemedText>
                {previewItems.map((item) => (
                  <ThemedText
                    color={isSelected ? 'fgPrimary' : 'fgSecondary'}
                    key={`${item.slug}-${item.id}`}
                    numberOfLines={1}
                    style={styles.previewText}
                    typography="labelSm"
                  >
                    {item.title}
                  </ThemedText>
                ))}
                {remainingCount > 0 ? (
                  <ThemedText
                    color={isSelected ? 'fgPrimary' : 'fgSecondary'}
                    numberOfLines={1}
                    style={styles.moreText}
                    typography="labelSm"
                  >
                    +{remainingCount}
                  </ThemedText>
                ) : null}
              </View>
            </Pressable>
          );
        }}
        enableSwipeMonths
        firstDay={1}
        hideExtraDays={false}
        markedDates={markedDates}
        monthFormat={'yyyy년 M월'}
        onDayPress={(day) => onSelectDate(day.dateString)}
        onMonthChange={(month) => onMonthChange(month.dateString)}
        style={styles.calendar}
        theme={{
          arrowColor: theme.colors.fgSurface,
          backgroundColor: theme.colors.surface,
          calendarBackground: theme.colors.surface,
          dayTextColor: theme.colors.fgSurface,
          monthTextColor: theme.colors.fgSurface,
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
