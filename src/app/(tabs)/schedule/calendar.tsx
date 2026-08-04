import type { LegendListProps, LegendListRef, OnViewableItemsChanged } from '@legendapp/list';

import { format } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useCalendars } from '@/entities/calendar/lib/queries';
import { CalendarEntity } from '@/entities/calendar/model';
import { useFeedSites } from '@/entities/feed/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import {
  findCalendarIndexForDate,
  getCalendarDateKey,
  getCalendarDateKeysInMonth,
  getMonthDateKey,
  parseCalendarDateKey,
} from '@/features/calendar/lib/isTodayCalendar';
import { CalendarContent } from '@/features/calendar/ui/CalendarContent';
import { type CalendarMarking, MonthlyCalendar } from '@/features/calendar/ui/MonthlyCalendar';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { Header } from '@/shared/ui/headers/Header';
import { SettingsIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const NATIVE_TAB_BAR_HEIGHT = 49;
const CALENDAR_COLLAPSE_OFFSET = 48;
const CALENDAR_ENTERING = FadeInUp.duration(180);
const CALENDAR_EXITING = FadeOutUp.duration(160);
const CALENDAR_LAYOUT_TRANSITION = LinearTransition.duration(180);
const PERIOD_COLORS = ['#5B8DEF', '#2BB673', '#F59E0B', '#E85D75', '#8B5CF6', '#14B8A6'];

const styles = StyleSheet.create((theme) => ({
  listHeader: {
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(1),
  },
  listSection: {
    flex: 1,
    gap: theme.gap(2),
  },
  root: {
    backgroundColor: theme.colors.surface,
    flex: 1,
    position: 'relative',
    width: '100%',
  },
  settingButton: {
    borderRadius: theme.cornerRadius.md,
    padding: theme.gap(1),
  },
  subtitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleButton: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.cornerRadius.md,
    paddingHorizontal: theme.gap(1.5),
    paddingVertical: theme.gap(1),
  },
  topView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(1),
    padding: theme.gap(3),
    width: '100%',
  },
}));

const getPeriodColor = (item: CalendarEntity) => {
  const key = item.slug;
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }

  return PERIOD_COLORS[hash % PERIOD_COLORS.length];
};

export default function ScheduleCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const [selectedCalendarSlugs] = useSetting('schedule.selectedCalendarSlugs');
  const [todayKey] = useState(() => getCalendarDateKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthDateKey(parseCalendarDateKey(todayKey)),
  );
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  const listRef = useRef<LegendListRef>(null);
  const didInitialScroll = useRef(false);
  const dragStartOffset = useRef(0);
  const hasUserScrolled = useRef(false);
  const reduceMotion = useReducedMotion();

  const { error: siteError, isSyncing: isSyncingSites, refresh: refreshSites } = useFeedSites();
  const { data, error, isSyncing, refresh } = useCalendars(selectedCalendarSlugs);
  const syncError = siteError ?? error;
  const hasSources = selectedCalendarSlugs.length > 0;
  const bottomPadding = NATIVE_TAB_BAR_HEIGHT + insets.bottom + 32;

  const scrollToDate = useCallback(
    (dateString: string, animated: boolean) => {
      const index = findCalendarIndexForDate(data, parseCalendarDateKey(dateString));

      if (index >= 0) {
        listRef.current?.scrollToIndex({ animated, index, viewPosition: 0 });
      }
    },
    [data],
  );

  useEffect(() => {
    if (didInitialScroll.current || data.length === 0) {
      return;
    }

    didInitialScroll.current = true;
    scrollToDate(todayKey, false);
  }, [data.length, scrollToDate, todayKey]);

  const handleSelectDate = useCallback(
    (dateString: string) => {
      setSelectedDate(dateString);
      setVisibleMonth(getMonthDateKey(parseCalendarDateKey(dateString)));
      scrollToDate(dateString, true);
    },
    [scrollToDate],
  );

  const handleMonthChange = useCallback(
    (dateString: string) => {
      const monthKey = getMonthDateKey(parseCalendarDateKey(dateString));
      setSelectedDate(monthKey);
      setVisibleMonth(monthKey);
      scrollToDate(monthKey, true);
    },
    [scrollToDate],
  );

  const handleListScroll = useCallback<NonNullable<LegendListProps<CalendarEntity>['onScroll']>>(
    (event) => {
      if (!hasUserScrolled.current) {
        return;
      }

      const offset = event.nativeEvent.contentOffset.y;
      setIsCalendarCollapsed(
        (current) => current || offset - dragStartOffset.current > CALENDAR_COLLAPSE_OFFSET,
      );
    },
    [],
  );

  const handleListScrollBeginDrag = useCallback<
    NonNullable<LegendListProps<CalendarEntity>['onScrollBeginDrag']>
  >((event) => {
    dragStartOffset.current = event.nativeEvent.contentOffset.y;
    hasUserScrolled.current = true;
  }, []);

  const handleToggleCalendar = useCallback(() => {
    hasUserScrolled.current = false;
    setIsCalendarCollapsed((current) => !current);
  }, []);

  const handleViewableItemsChanged = useCallback<
    NonNullable<OnViewableItemsChanged<CalendarEntity>>
  >(({ viewableItems }) => {
    const visibleItem = viewableItems.find(
      ({ item }) => item.startsAt !== null || item.endsAt !== null,
    )?.item;
    const timestamp = visibleItem?.startsAt ?? visibleItem?.endsAt;

    if (timestamp === null || timestamp === undefined) {
      return;
    }

    const date = new Date(timestamp);
    setSelectedDate(getCalendarDateKey(date));
    setVisibleMonth(getMonthDateKey(date));
  }, []);

  const monthMarkedDates = useMemo(() => {
    const monthDate = parseCalendarDateKey(visibleMonth);
    const marks = data.reduce<Record<string, CalendarMarking>>((acc, item) => {
      const dateKeys = getCalendarDateKeysInMonth(item, monthDate);

      dateKeys.forEach((dateKey, index) => {
        const periods = acc[dateKey]?.periods ?? [];
        periods.push({
          color: getPeriodColor(item),
          endingDay: index === dateKeys.length - 1,
          startingDay: index === 0,
        });
        acc[dateKey] = { ...acc[dateKey], periods };
      });

      return acc;
    }, {});

    marks[selectedDate] = {
      ...marks[selectedDate],
      periods: marks[selectedDate]?.periods ?? [],
      selected: true,
      selectedColor: theme.colors.primary,
      selectedTextColor: theme.colors.fgPrimary,
    };

    return marks;
  }, [data, selectedDate, theme.colors.fgPrimary, theme.colors.primary, visibleMonth]);

  const handleRefresh = useCallback(() => {
    if (isSyncing || isSyncingSites) {
      return;
    }

    void Promise.all([refreshSites(), refresh()]);
  }, [isSyncing, isSyncingSites, refresh, refreshSites]);

  const handleOpenUrl = useCallback(async (url: null | string) => {
    if (!url) {
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (openError) {
      console.error('Failed to open feed URL:', openError);
    }
  }, []);

  const handlePressCalendar = useCallback(
    (item: CalendarEntity) => {
      void handleOpenUrl(item.url);
    },
    [handleOpenUrl],
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/more/settings/feed')}
              style={styles.settingButton}
            >
              <SettingsIcon color={theme.colorsHex.fgSurface} size={24} />
            </Pressable>
          ),
          headerTitle: () => <></>,
          headerTransparent: true,
          title: '일정',
        }}
      />
      <View style={styles.root}>
        <SafeContainer>
          {Platform.OS === 'ios' && <Space gap={2} />}
          <View style={styles.topView}>
            <Header title="일정" />
            <View style={styles.subtitleRow}>
              <ThemedText color="fgSecondary" typography="labelMd">
                월간 일정
              </ThemedText>
              {hasSources ? (
                <Pressable
                  accessibilityLabel={isCalendarCollapsed ? '캘린더 펼치기' : '캘린더 접기'}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: !isCalendarCollapsed }}
                  hitSlop={6}
                  onPress={handleToggleCalendar}
                  style={styles.toggleButton}
                >
                  <ThemedText color="fgSecondary" typography="labelSm">
                    {isCalendarCollapsed ? '펼치기' : '접기'}
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          </View>

          {hasSources && !isCalendarCollapsed ? (
            <Animated.View
              entering={reduceMotion ? undefined : CALENDAR_ENTERING}
              exiting={reduceMotion ? undefined : CALENDAR_EXITING}
            >
              <MonthlyCalendar
                markedDates={monthMarkedDates}
                onMonthChange={handleMonthChange}
                onSelectDate={handleSelectDate}
                visibleMonth={visibleMonth}
              />
            </Animated.View>
          ) : null}

          <Animated.View
            layout={reduceMotion ? undefined : CALENDAR_LAYOUT_TRANSITION}
            style={styles.listSection}
          >
            {hasSources ? (
              <View style={styles.listHeader}>
                <ThemedText typography="headingLg">전체 일정</ThemedText>
                <ThemedText color="fgSecondary" typography="bodySm">
                  {format(parseCalendarDateKey(visibleMonth), 'yyyy년 M월')}
                </ThemedText>
              </View>
            ) : null}

            <CalendarContent
              error={syncError}
              hasSources={hasSources}
              isSyncing={isSyncing || isSyncingSites}
              items={data}
              listContentContainerStyle={{ paddingBottom: bottomPadding }}
              listRef={listRef}
              onPressItem={handlePressCalendar}
              onRefresh={handleRefresh}
              onScroll={handleListScroll}
              onScrollBeginDrag={handleListScrollBeginDrag}
              onViewableItemsChanged={handleViewableItemsChanged}
              scrollEventThrottle={32}
            />
          </Animated.View>
        </SafeContainer>
      </View>
    </>
  );
}
