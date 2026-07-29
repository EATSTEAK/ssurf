import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { CalendarProvider } from 'react-native-calendars';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useCalendars } from '@/entities/calendar/lib/queries';
import { CalendarEntity } from '@/entities/calendar/model';
import { useFeedSites } from '@/entities/feed/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import {
  getCalendarDateKey,
  getCalendarDateKeysInMonth,
  getCalendarDateKeysInWeek,
  getMonthDateKey,
  isCalendarOnDate,
  parseCalendarDateKey,
} from '@/features/calendar/lib/isTodayCalendar';
import { CompactCalendarRow } from '@/features/calendar/ui/CompactCalendarRow';
import { type CalendarMarking, MonthlyCalendar } from '@/features/calendar/ui/MonthlyCalendar';
import { WeeklyCalendar } from '@/features/calendar/ui/WeeklyCalendar';
import { CardView } from '@/shared/ui/containers/CardView';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { SettingsIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { type ViewMode, ViewModeSegmentedControl } from '@/shared/ui/ViewModeSegmentedControl';

const NATIVE_TAB_BAR_HEIGHT = 49;
const PERIOD_COLORS = ['#5B8DEF', '#2BB673', '#F59E0B', '#E85D75', '#8B5CF6', '#14B8A6'];

const styles = StyleSheet.create((theme) => ({
  emptySection: {
    alignItems: 'center',
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(4),
  },
  list: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.cornerRadius.md,
    overflow: 'hidden',
  },
  root: {
    backgroundColor: theme.colors.surface,
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.cornerRadius.lg,
    gap: theme.gap(2),
    paddingVertical: theme.gap(3),
  },
  settingButton: {
    borderRadius: theme.cornerRadius.md,
    padding: theme.gap(1),
  },
  topView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(3),
    width: '100%',
    padding: theme.gap(3),
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
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getCalendarDateKey(today), [today]);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(getMonthDateKey(today));
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const {
    data: sites,
    error: siteError,
    isSyncing: isSyncingSites,
    refresh: refreshSites,
  } = useFeedSites();
  const calendarSites = useMemo(() => sites.filter((site) => site.kind === 'calendar'), [sites]);
  const { data, error, isSyncing, refresh } = useCalendars(selectedCalendarSlugs);
  const syncError = siteError ?? error;

  const handleSelectDate = useCallback((dateString: string) => {
    setSelectedDate(dateString);
    setVisibleMonth(getMonthDateKey(parseCalendarDateKey(dateString)));
  }, []);

  const selectedDateItems = useMemo(
    () => data.filter((item) => isCalendarOnDate(item, parseCalendarDateKey(selectedDate))),
    [data, selectedDate],
  );

  const buildMarkedDates = useCallback(
    (resolveDateKeys: (item: CalendarEntity) => string[]) => {
      const marks = data.reduce<Record<string, CalendarMarking>>((acc, item) => {
        const dateKeys = resolveDateKeys(item);

        dateKeys.forEach((dateKey, index) => {
          const periods = acc[dateKey]?.periods ?? [];
          periods.push({
            color: getPeriodColor(item),
            endingDay: index === dateKeys.length - 1,
            startingDay: index === 0,
          });
          acc[dateKey] = {
            ...acc[dateKey],
            periods,
          };
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
    },
    [data, selectedDate, theme.colors.fgPrimary, theme.colors.primary],
  );

  const monthMarkedDates = useMemo(() => {
    const monthDate = parseCalendarDateKey(visibleMonth);
    return buildMarkedDates((item) => getCalendarDateKeysInMonth(item, monthDate));
  }, [buildMarkedDates, visibleMonth]);

  const weekMarkedDates = useMemo(() => {
    const weekDate = parseCalendarDateKey(selectedDate);
    return buildMarkedDates((item) => getCalendarDateKeysInWeek(item, weekDate));
  }, [buildMarkedDates, selectedDate]);

  const scrollY = useSharedValue(0);
  const bottomPadding = NATIVE_TAB_BAR_HEIGHT + insets.bottom + 32;

  const handleRefresh = useCallback(() => {
    if (isSyncing || isSyncingSites) {
      return;
    }

    void Promise.all([refreshSites(), refresh()]);
  }, [isSyncing, isSyncingSites, refresh, refreshSites]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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
            <Pressable onPress={() => router.push('/settings/feed')} style={styles.settingButton}>
              <SettingsIcon color={theme.colorsHex.fgSurface} size={24} />
            </Pressable>
          ),
          headerTitle: () => <></>,
          headerTransparent: true,
          title: '일정',
        }}
      />
      <View style={styles.root}>
        <RefreshableScrollView
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          onRefresh={handleRefresh}
          onScroll={scrollHandler}
          refreshing={isSyncing || isSyncingSites}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="일정" />
              <ThemedText color="fgSecondary" typography="labelMd">
                {viewMode === 'week' ? '주간 일정' : '월간 일정'}
              </ThemedText>

              <ViewModeSegmentedControl onChange={setViewMode} value={viewMode} />
            </View>

            {calendarSites.length > 0 && selectedCalendarSlugs.length > 0 ? (
              viewMode === 'week' ? (
                <CalendarProvider date={selectedDate} onDateChanged={handleSelectDate}>
                  <WeeklyCalendar
                    currentDate={selectedDate}
                    markedDates={weekMarkedDates}
                    onSelectDate={handleSelectDate}
                  />
                </CalendarProvider>
              ) : (
                <MonthlyCalendar
                  markedDates={monthMarkedDates}
                  onMonthChange={setVisibleMonth}
                  onSelectDate={handleSelectDate}
                  visibleMonth={visibleMonth}
                />
              )
            ) : null}
            <CardView>
              <View style={{ paddingHorizontal: 12 }}>
                <ThemedText typography="headingLg">선택한 날짜 일정</ThemedText>
                <ThemedText color="fgSecondary" typography="bodySm">
                  {selectedDate.replace(/-/g, '.')}
                </ThemedText>
              </View>
              {/* TODO: 일정 소스가 더 늘어나면 여기서 선택 UI를 제공한다. */}
              {syncError ? (
                <View style={styles.emptySection}>
                  <ThemedText color="error" typography="bodyMd">
                    일정을 불러오지 못했어요
                  </ThemedText>
                </View>
              ) : selectedCalendarSlugs.length === 0 ? (
                <View style={styles.emptySection}>
                  <ThemedText typography="bodyMd">선택된 일정 소스가 없어요</ThemedText>
                </View>
              ) : selectedDateItems.length === 0 ? (
                <View style={styles.emptySection}>
                  <ThemedText typography="bodyMd">선택한 날짜의 일정이 없어요</ThemedText>
                </View>
              ) : (
                <View style={styles.list}>
                  {selectedDateItems.map((item, index) => (
                    <CompactCalendarRow
                      isLast={index === selectedDateItems.length - 1}
                      item={item}
                      key={`${item.slug}-${item.id}`}
                      onPress={handlePressCalendar}
                    />
                  ))}
                </View>
              )}
            </CardView>
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader
          label={viewMode === 'week' ? '주간 일정' : '월간 일정'}
          scrollY={scrollY}
          title="일정"
        />
      </View>
    </>
  );
}
