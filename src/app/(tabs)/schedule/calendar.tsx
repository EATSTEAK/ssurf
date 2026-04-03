import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useCalendars } from '@/entities/calendar/lib/queries';
import { useSyncCalendars } from '@/entities/calendar/lib/sync';
import { CalendarEntity } from '@/entities/calendar/model';
import { useFeedSites } from '@/entities/feed/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import {
  getCalendarDateKey,
  getCalendarDateKeysInMonth,
  getMonthDateKey,
  isCalendarOnDate,
  parseCalendarDateKey,
} from '@/features/calendar/lib/isTodayCalendar';
import { CompactCalendarRow } from '@/features/calendar/ui/CompactCalendarRow';
import { MonthlyCalendar } from '@/features/calendar/ui/MonthlyCalendar';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { SettingsIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const NATIVE_TAB_BAR_HEIGHT = 49;

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
    padding: theme.gap(3),
  },
  settingButton: {
    borderRadius: theme.cornerRadius.md,
    padding: theme.gap(1),
  },
  topView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(3),
    padding: theme.gap(3),
    width: '100%',
  },
}));

export default function ScheduleCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { studentId } = useRusaintApplication();
  const [selectedCalendarSlugs] = useSetting('selectedScheduleCalendarSlugs');
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getCalendarDateKey(today), [today]);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(getMonthDateKey(today));

  const { data: sites } = useFeedSites();
  const { sync, syncSites } = useSyncCalendars(studentId ?? '');
  const calendarSites = useMemo(() => sites.filter((site) => site.kind === 'calendar'), [sites]);

  useEffect(() => {
    void syncSites();
  }, [syncSites]);

  const { data, error, isSyncing } = useCalendars(studentId ?? '', selectedCalendarSlugs);

  const selectedDateItems = useMemo(
    () => data.filter((item) => isCalendarOnDate(item, parseCalendarDateKey(selectedDate))),
    [data, selectedDate],
  );
  const monthlyItems = useMemo(() => {
    const monthDate = parseCalendarDateKey(visibleMonth);

    return data.reduce<Record<string, CalendarEntity[]>>((acc, item) => {
      for (const dateKey of getCalendarDateKeysInMonth(item, monthDate)) {
        acc[dateKey] = [...(acc[dateKey] ?? []), item];
      }
      return acc;
    }, {});
  }, [data, visibleMonth]);

  const scrollY = useSharedValue(0);
  const bottomPadding = NATIVE_TAB_BAR_HEIGHT + insets.bottom + 32;

  const handleRefresh = useCallback(() => {
    if (isSyncing) {
      return;
    }

    void syncSites({ force: true });
    void sync(selectedCalendarSlugs, { force: true });
  }, [isSyncing, selectedCalendarSlugs, sync, syncSites]);

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
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        console.error(`Cannot open feed URL: ${url}`);
        return;
      }

      await Linking.openURL(url);
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
              <SettingsIcon color="white" size={24} />
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
          refreshing={isSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="일정" />
              <ThemedText color="fgSecondary" typography="labelMd">
                월간 일정
              </ThemedText>

              {calendarSites.length > 0 && selectedCalendarSlugs.length > 0 ? (
                <MonthlyCalendar
                  dayItems={monthlyItems}
                  onMonthChange={setVisibleMonth}
                  onSelectDate={setSelectedDate}
                  selectedDate={selectedDate}
                  todayKey={todayKey}
                  visibleMonth={visibleMonth}
                />
              ) : null}

              <View style={styles.section}>
                <ThemedText typography="headingLg">선택한 날짜 일정</ThemedText>
                <ThemedText color="fgSecondary" typography="bodySm">
                  {selectedDate.replace(/-/g, '.')}
                </ThemedText>
                {selectedCalendarSlugs.length === 0 ? (
                  <View style={styles.emptySection}>
                    <ThemedText typography="bodyMd">선택된 일정 소스가 없어요</ThemedText>
                  </View>
                ) : error ? (
                  <View style={styles.emptySection}>
                    <ThemedText color="error" typography="bodyMd">
                      일정을 불러오지 못했어요
                    </ThemedText>
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
              </View>
            </View>
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader label="월간 일정" scrollY={scrollY} title="일정" />
      </View>
    </>
  );
}
