import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useCalendars } from '@/entities/calendar/lib/queries';
import { useSyncCalendars } from '@/entities/calendar/lib/sync';
import { CalendarEntity } from '@/entities/calendar/model';
import { useFeedSites } from '@/entities/feed/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import { CalendarContent } from '@/features/calendar/ui/CalendarContent';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { SettingsIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const NATIVE_TAB_BAR_HEIGHT = 49;

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  topView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'column',
    padding: theme.gap(3),
  },
  listContent: {
    paddingBottom: theme.gap(8),
  },
  settingButton: {
    padding: theme.gap(1),
    borderRadius: theme.cornerRadius.md,
  },
}));

export default function ScheduleCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { studentId } = useRusaintApplication();
  const [selectedCalendarSlugs] = useSetting('selectedScheduleCalendarSlugs');

  const { data: sites } = useFeedSites();
  const { syncEntry, syncSites } = useSyncCalendars(studentId ?? '');
  const calendarSites = useMemo(() => sites.filter((site) => site.kind === 'calendar'), [sites]);

  useEffect(() => {
    void syncSites();
  }, [syncSites]);

  const { data, error, isSyncing } = useCalendars(studentId ?? '', selectedCalendarSlugs);

  const scrollY = useSharedValue(0);
  const listBottomPadding =
    NATIVE_TAB_BAR_HEIGHT + insets.bottom + styles.listContent.paddingBottom;

  const handleRefresh = useCallback(() => {
    if (isSyncing) {
      return;
    }

    void syncSites({ force: true });
    void Promise.all(selectedCalendarSlugs.map((slug) => syncEntry(slug, { force: true })));
  }, [isSyncing, selectedCalendarSlugs, syncEntry, syncSites]);

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
          headerTransparent: true,
          title: '일정',
          headerTitle: () => <></>,
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings/feed')} style={styles.settingButton}>
              <SettingsIcon color="white" size={24} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.root}>
        <CalendarContent
          error={error}
          hasSources={calendarSites.length > 0 && selectedCalendarSlugs.length > 0}
          headerComponent={
            <SafeContainer>
              {Platform.OS === 'ios' && <Space gap={2} />}
              <View style={styles.topView}>
                <Header title="일정" />
                <ThemedText color="fgSecondary" typography="labelMd">
                  전체 일정
                </ThemedText>
              </View>
            </SafeContainer>
          }
          isSyncing={isSyncing}
          items={data}
          listContentContainerStyle={[styles.listContent, { paddingBottom: listBottomPadding }]}
          onPressItem={handlePressCalendar}
          onRefresh={handleRefresh}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
        <FloatingHeader label="전체 일정" scrollY={scrollY} title="일정" />
      </View>
    </>
  );
}
