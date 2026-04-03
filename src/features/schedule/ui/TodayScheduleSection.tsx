import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CalendarEntity } from '@/entities/calendar/model';
import { CompactCalendarRow } from '@/features/calendar/ui/CompactCalendarRow';
import { ArrowForwardIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  action: {
    paddingVertical: 0,
    width: 'auto',
  },
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(1),
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.cornerRadius.lg,
  },
  empty: {
    alignItems: 'center',
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(4),
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.cornerRadius.md,
    overflow: 'hidden',
  },
  title: {
    flex: 1,
    gap: theme.gap(0.5),
  },
}));

interface TodayScheduleSectionProps {
  actionLabel?: string;
  calendarError: Error | null;
  onPressAction?: () => void;
  onPressCalendar: (item: CalendarEntity) => void;
  selectedCalendarSlugs: string[];
  todayCalendars: CalendarEntity[];
}

export const TodayScheduleSection = ({
  actionLabel,
  calendarError,
  onPressAction,
  onPressCalendar,
  selectedCalendarSlugs,
  todayCalendars,
}: TodayScheduleSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <ThemedText typography="headingLg">오늘의 일정</ThemedText>
        </View>
        {onPressAction && actionLabel ? (
          <Button
            onPress={onPressAction}
            style={styles.action}
            textStyle={{ fontSize: 14 }}
            variant="surface"
          >
            {() => (
              <View style={styles.actionButton}>
                <ThemedText color="fgPrimary" typography="labelMd">
                  {actionLabel}
                </ThemedText>
                <ArrowForwardIcon color="white" size={16} />
              </View>
            )}
          </Button>
        ) : null}
      </View>

      {selectedCalendarSlugs.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText typography="bodyMd">선택된 일정 소스가 없어요</ThemedText>
          <ThemedText color="fgSecondary" typography="bodySm">
            설정에서 일정 소스를 선택해주세요
          </ThemedText>
        </View>
      ) : calendarError ? (
        <View style={styles.empty}>
          <ThemedText color="error" typography="bodyMd">
            오늘 일정을 불러오지 못했어요
          </ThemedText>
          <ThemedText color="fgSecondary" typography="bodySm">
            아래로 당겨 다시 시도해주세요
          </ThemedText>
        </View>
      ) : todayCalendars.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText typography="bodyMd">오늘 등록된 일정이 없어요</ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {todayCalendars.map((item, index) => (
            <CompactCalendarRow
              isLast={index === todayCalendars.length - 1}
              item={item}
              key={`${item.slug}-${item.id}`}
              onPress={onPressCalendar}
            />
          ))}
        </View>
      )}
    </View>
  );
};
