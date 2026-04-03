import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useFeedCalendars, useFeedNotices, useFeedSites } from '@/entities/feed/lib/queries';
import { useSyncFeed } from '@/entities/feed/lib/sync';
import { FeedCalendarEntity, FeedNoticeListItem } from '@/entities/feed/model';
import { useSetting } from '@/entities/settings/lib/queries';
import { NoticeCard } from '@/features/feed/ui/NoticeCard';
import { TodayScheduleSection } from '@/features/schedule/ui/TodayScheduleSection';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { SettingsIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';

const NOTICE_PREVIEW_LIMIT = 3;

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  content: {
    paddingBottom: theme.gap(8),
  },
  topView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(3),
    flexDirection: 'column',
    paddingVertical: theme.gap(3),
  },
  headerContainer: {
    paddingHorizontal: theme.gap(3),
  },
  settingButton: {
    padding: theme.gap(1),
    borderRadius: theme.cornerRadius.md,
  },
}));

function isTodayCalendar(item: FeedCalendarEntity, now: Date) {
  const start = item.startsAt ?? item.endsAt;
  const end = item.endsAt ?? item.startsAt;

  if (!start || !end) {
    return false;
  }

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return start <= endOfDay.getTime() && end >= startOfDay.getTime();
}

export default function FeedScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { studentId } = useRusaintApplication();

  const [selectedNoticeSlugs, setSelectedNoticeSlugs] = useSetting('selectedNoticeSlugs');
  const [selectedNoticeSlug, setSelectedNoticeSlug] = useSetting('selectedNoticeSlug');
  const [selectedCalendarSlugs] = useSetting('selectedCalendarSlugs');

  const { data: sites } = useFeedSites();
  const { syncEntry, syncSites } = useSyncFeed(studentId ?? '');

  const noticeSites = useMemo(() => sites.filter((site) => site.kind === 'notice'), [sites]);
  const availableSelectedNoticeSlugs = useMemo(
    () => selectedNoticeSlugs.filter((slug) => noticeSites.some((site) => site.slug === slug)),
    [noticeSites, selectedNoticeSlugs],
  );
  const currentNoticeSlug =
    availableSelectedNoticeSlugs.find((slug) => slug === selectedNoticeSlug) ??
    availableSelectedNoticeSlugs[0] ??
    noticeSites[0]?.slug ??
    '';
  const visibleNoticeSites = useMemo(
    () => noticeSites.filter((site) => availableSelectedNoticeSlugs.includes(site.slug)),
    [availableSelectedNoticeSlugs, noticeSites],
  );
  const noticeSlugs = useMemo(
    () =>
      visibleNoticeSites.length > 0
        ? visibleNoticeSites.map((site) => site.slug)
        : currentNoticeSlug
          ? [currentNoticeSlug]
          : [],
    [currentNoticeSlug, visibleNoticeSites],
  );

  useEffect(() => {
    void syncSites();
  }, [syncSites]);

  useEffect(() => {
    if (noticeSites.length === 0) {
      return;
    }

    if (availableSelectedNoticeSlugs.length === 0) {
      void setSelectedNoticeSlugs([noticeSites[0].slug]);
      void setSelectedNoticeSlug(noticeSites[0].slug);
      return;
    }

    if (!availableSelectedNoticeSlugs.includes(selectedNoticeSlug)) {
      void setSelectedNoticeSlug(availableSelectedNoticeSlugs[0]);
    }
  }, [
    availableSelectedNoticeSlugs,
    noticeSites,
    selectedNoticeSlug,
    setSelectedNoticeSlug,
    setSelectedNoticeSlugs,
  ]);

  const {
    data: notices,
    error: noticeError,
    isSyncing: isNoticeSyncing,
  } = useFeedNotices(studentId ?? '', noticeSlugs);
  const {
    data: calendars,
    error: calendarError,
    isSyncing: isCalendarSyncing,
  } = useFeedCalendars(studentId ?? '', selectedCalendarSlugs);

  const todayCalendars = useMemo(() => {
    const now = new Date();
    return calendars.filter((item) => isTodayCalendar(item, now));
  }, [calendars]);

  const noticePreviewItemsBySlug = useMemo(() => {
    return visibleNoticeSites.reduce<Record<string, FeedNoticeListItem[]>>((acc, site) => {
      acc[site.slug] = notices
        .filter((item) => item.slug === site.slug)
        .slice(0, NOTICE_PREVIEW_LIMIT);
      return acc;
    }, {});
  }, [notices, visibleNoticeSites]);

  const scrollY = useSharedValue(0);

  const handleRefresh = useCallback(() => {
    if (isNoticeSyncing || isCalendarSyncing) {
      return;
    }

    void syncSites({ force: true });

    if (!currentNoticeSlug) {
      return;
    }

    void syncEntry(currentNoticeSlug, { force: true });
  }, [currentNoticeSlug, isCalendarSyncing, isNoticeSyncing, syncEntry, syncSites]);

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
    } catch (error) {
      console.error('Failed to open feed URL:', error);
    }
  }, []);

  const handlePressNotice = useCallback(
    (item: FeedNoticeListItem) => {
      void handleOpenUrl(item.url);
    },
    [handleOpenUrl],
  );

  const handlePressCalendar = useCallback(
    (item: FeedCalendarEntity) => {
      void handleOpenUrl(item.url);
    },
    [handleOpenUrl],
  );

  const handleOpenNoticePage = useCallback(() => {
    router.push('/feed/notice');
  }, [router]);

  const handleSelectNoticeSlug = useCallback(
    (slug: string) => {
      if (slug === currentNoticeSlug) {
        return;
      }

      void setSelectedNoticeSlug(slug);
    },
    [currentNoticeSlug, setSelectedNoticeSlug],
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '피드',
          headerTitle: () => <></>,
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings/feed')} style={styles.settingButton}>
              <SettingsIcon color="white" size={24} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.root}>
        <RefreshableScrollView
          contentContainerStyle={styles.content}
          onRefresh={handleRefresh}
          onScroll={scrollHandler}
          refreshing={isNoticeSyncing || isCalendarSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <View style={styles.headerContainer}>
                <Header title="피드" />
              </View>

              <TodayScheduleSection
                calendarError={calendarError ?? null}
                onPressAction={() => router.push('/(tabs)/schedule/calendar')}
                onPressCalendar={handlePressCalendar}
                selectedCalendarSlugs={selectedCalendarSlugs}
                todayCalendars={todayCalendars}
              />

              <NoticeCard
                actionLabel="전체 공지 보기"
                currentNoticeSlug={currentNoticeSlug}
                error={noticeError}
                itemsBySlug={noticePreviewItemsBySlug}
                limit={NOTICE_PREVIEW_LIMIT}
                onPressAction={handleOpenNoticePage}
                onPressNotice={handlePressNotice}
                onSelectNoticeSlug={handleSelectNoticeSlug}
                sites={visibleNoticeSites}
                width={width}
              />
            </View>
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader label="공지사항" scrollY={scrollY} title="피드" />
      </View>
    </>
  );
}
