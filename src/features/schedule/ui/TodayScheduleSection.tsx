import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { FeedCalendarEntity } from '@/entities/feed/model';
import { FeedCalendarItem } from '@/features/feed/ui/FeedCalendarItem';
import { ArrowForwardIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.gap(3),
    gap: theme.gap(2),
    borderRadius: theme.cornerRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.gap(2),
  },
  title: {
    gap: theme.gap(0.5),
    flex: 1,
  },
  action: {
    width: 'auto',
    paddingHorizontal: theme.gap(2),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  list: {
    overflow: 'hidden',
    borderRadius: theme.cornerRadius.md,
    backgroundColor: theme.colors.surfaceDim,
  },
  empty: {
    paddingVertical: theme.gap(4),
    paddingHorizontal: theme.gap(3),
    alignItems: 'center',
    gap: theme.gap(1),
  },
}));

interface TodayScheduleSectionProps {
  calendarError: Error | null;
  onPressAction: () => void;
  onPressCalendar: (item: FeedCalendarEntity) => void;
  selectedCalendarSlugs: string[];
  todayCalendars: FeedCalendarEntity[];
}

export const TodayScheduleSection = ({
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
          <ThemedText color="fgSecondary" typography="bodySm">
            오늘 포함된 피드 일정만 모아봤어요
          </ThemedText>
        </View>
        <Button
          onPress={onPressAction}
          style={styles.action}
          textStyle={{ fontSize: 14 }}
          variant="surface"
        >
          {() => (
            <View style={styles.actionButton}>
              <ThemedText color="fgPrimary" typography="labelMd">
                전체 일정 보기
              </ThemedText>
              <ArrowForwardIcon color="white" size={16} />
            </View>
          )}
        </Button>
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
            <FeedCalendarItem
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
