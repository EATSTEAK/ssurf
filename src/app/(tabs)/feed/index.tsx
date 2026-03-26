import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useFeedCalendars, useFeedNotices, useFeedSites } from '@/entities/feed/lib/queries';
import { useSyncFeed } from '@/entities/feed/lib/sync';
import { FeedCalendarEntity, FeedNoticeListItem } from '@/entities/feed/model';
import { FeedCalendarItem } from '@/features/feed/ui/FeedCalendarItem';
import { NoticeCard } from '@/features/feed/ui/NoticeCard';
import { useExpoSecureStore } from '@/shared/lib/useExpoSecureStore';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { ArrowForwardIcon, SettingsIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const DEFAULT_NOTICE_SLUG = 'scatch.ssu.ac.kr';
const DEFAULT_SELECTED_NOTICE_SLUGS = [DEFAULT_NOTICE_SLUG];
const DEFAULT_SELECTED_CALENDAR_SLUGS = ['calendar/ssu-academic-calendar'];
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
  todaySection: {
    padding: theme.gap(3),
    gap: theme.gap(2),
    borderRadius: theme.cornerRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  todaySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.gap(2),
  },
  todaySectionTitle: {
    gap: theme.gap(0.5),
    flex: 1,
  },
  todaySectionAction: {
    width: 'auto',
    paddingHorizontal: theme.gap(2),
  },
  todaySectionList: {
    overflow: 'hidden',
    borderRadius: theme.cornerRadius.md,
    backgroundColor: theme.colors.surfaceDim,
  },
  todaySectionEmpty: {
    paddingVertical: theme.gap(4),
    paddingHorizontal: theme.gap(3),
    alignItems: 'center',
    gap: theme.gap(1),
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
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

  const [selectedNoticeSlugs, setSelectedNoticeSlugs] = useExpoSecureStore<string[]>({
    key: 'feed.selectedNoticeSlugs',
    defaultValue: DEFAULT_SELECTED_NOTICE_SLUGS,
  });
  const [selectedNoticeSlug, setSelectedNoticeSlug] = useExpoSecureStore<string>({
    key: 'feed.selectedNoticeSlug',
    defaultValue: DEFAULT_NOTICE_SLUG,
  });
  const [selectedCalendarSlugs] = useExpoSecureStore<string[]>({
    key: 'feed.selectedCalendarSlugs',
    defaultValue: DEFAULT_SELECTED_CALENDAR_SLUGS,
  });

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
            <Pressable onPress={() => router.push('/feed/settings')} style={styles.settingButton}>
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

              <View style={styles.todaySection}>
                <View style={styles.todaySectionHeader}>
                  <View style={styles.todaySectionTitle}>
                    <ThemedText typography="headingLg">오늘의 일정</ThemedText>
                    <ThemedText color="fgSecondary" typography="bodySm">
                      오늘 포함된 피드 일정만 모아봤어요
                    </ThemedText>
                  </View>
                  <Button
                    onPress={() => router.push('/(tabs)/feed/schedule')}
                    style={styles.todaySectionAction}
                    textStyle={{ fontSize: 14 }}
                    variant="surface"
                  >
                    {() => (
                      <View style={styles.sectionActionButton}>
                        <ThemedText color="fgPrimary" typography="labelMd">
                          전체 일정 보기
                        </ThemedText>
                        <ArrowForwardIcon color="white" size={16} />
                      </View>
                    )}
                  </Button>
                </View>

                {selectedCalendarSlugs.length === 0 ? (
                  <View style={styles.todaySectionEmpty}>
                    <ThemedText typography="bodyMd">선택된 일정 소스가 없어요</ThemedText>
                    <ThemedText color="fgSecondary" typography="bodySm">
                      설정에서 일정 소스를 선택해주세요
                    </ThemedText>
                  </View>
                ) : calendarError ? (
                  <View style={styles.todaySectionEmpty}>
                    <ThemedText color="error" typography="bodyMd">
                      오늘 일정을 불러오지 못했어요
                    </ThemedText>
                    <ThemedText color="fgSecondary" typography="bodySm">
                      아래로 당겨 다시 시도해주세요
                    </ThemedText>
                  </View>
                ) : todayCalendars.length === 0 ? (
                  <View style={styles.todaySectionEmpty}>
                    <ThemedText typography="bodyMd">오늘 등록된 일정이 없어요</ThemedText>
                  </View>
                ) : (
                  <View style={styles.todaySectionList}>
                    {todayCalendars.map((item, index) => (
                      <FeedCalendarItem
                        isLast={index === todayCalendars.length - 1}
                        item={item}
                        key={`${item.slug}-${item.id}`}
                        onPress={handlePressCalendar}
                      />
                    ))}
                  </View>
                )}
              </View>

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
