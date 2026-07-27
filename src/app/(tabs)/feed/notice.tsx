import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { useFeedNotices, useFeedSites } from '@/entities/feed/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import { FeedNoticeTabScene } from '@/features/feed/ui/FeedNoticeTabScene';
import { CollapsibleTabs } from '@/shared/ui/collapsible-tabs/CollapsibleTabs';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { RefreshHeader, RefreshState } from '@/shared/ui/headers/RefreshHeader';
import { SettingsIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { Space } from '@/shared/ui/primitives/Space';
import { TabsRoute, TabsTabBar } from '@/shared/ui/primitives/Tabs';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const NATIVE_TAB_BAR_HEIGHT = 49;

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDim,
  },
  topView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'column',
    paddingVertical: theme.gap(3),
  },
  topInnerView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'column',
    paddingHorizontal: theme.gap(3),
  },
  tabsWrapper: {
    gap: theme.gap(1),
  },
  emptyState: {
    paddingVertical: theme.gap(6),
    paddingHorizontal: theme.gap(3),
    alignItems: 'center',
    gap: theme.gap(1),
    backgroundColor: theme.colors.surface,
  },
  statusView: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 16,
    marginBottom: 96,
  },
  imageView: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  sceneListContent: {
    paddingBottom: theme.gap(8),
  },
  settingButton: {
    padding: theme.gap(1),
    borderRadius: theme.cornerRadius.md,
  },
}));

export default function FeedNoticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedNoticeSlugs, setSelectedNoticeSlugs] = useSetting('selectedNoticeSlugs');
  const [selectedNoticeSlug, setSelectedNoticeSlug] = useSetting('selectedNoticeSlug');
  const pullDistance = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const refreshState = useSharedValue<RefreshState>(RefreshState.Idle);

  const {
    data: sites,
    error: siteError,
    isSyncing: isSiteSyncing,
    refresh: refreshSites,
    updatedAt: sitesUpdatedAt,
  } = useFeedSites();
  const noticeSites = useMemo(() => sites.filter((site) => site.kind === 'notice'), [sites]);
  const visibleNoticeSites = useMemo(
    () => noticeSites.filter((site) => selectedNoticeSlugs.includes(site.slug)),
    [noticeSites, selectedNoticeSlugs],
  );

  useEffect(() => {
    if (noticeSites.length === 0) {
      return;
    }

    if (visibleNoticeSites.length === 0) {
      void setSelectedNoticeSlugs([noticeSites[0].slug]);
      void setSelectedNoticeSlug(noticeSites[0].slug);
      return;
    }

    if (!visibleNoticeSites.some((site) => site.slug === selectedNoticeSlug)) {
      void setSelectedNoticeSlug(visibleNoticeSites[0].slug);
    }
  }, [
    noticeSites,
    selectedNoticeSlug,
    setSelectedNoticeSlug,
    setSelectedNoticeSlugs,
    visibleNoticeSites,
  ]);

  const currentNoticeSlug =
    visibleNoticeSites.find((site) => site.slug === selectedNoticeSlug)?.slug ??
    visibleNoticeSites[0]?.slug ??
    '';
  const {
    error: noticeError,
    isSyncing: isNoticeSyncing,
    refresh: refreshNotices,
  } = useFeedNotices(currentNoticeSlug ? [currentNoticeSlug] : []);
  const error = siteError ?? noticeError;
  const isSyncing = isSiteSyncing || isNoticeSyncing;

  useEffect(() => {
    refreshState.value = isSyncing ? RefreshState.Syncing : RefreshState.Idle;
  }, [isSyncing, refreshState]);

  const routes = useMemo<TabsRoute[]>(
    () =>
      visibleNoticeSites.map((site) => ({
        key: site.slug,
        title: site.title,
      })),
    [visibleNoticeSites],
  );
  const currentIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === currentNoticeSlug),
  );
  const navigationState = useMemo(() => ({ index: currentIndex, routes }), [currentIndex, routes]);

  const [visitedSlugs, setVisitedSlugs] = useState(new Set<string>());
  const loadedSlugs = useMemo(() => {
    const next = new Set(visitedSlugs);
    if (currentNoticeSlug) {
      next.add(currentNoticeSlug);
    }
    return next;
  }, [visitedSlugs, currentNoticeSlug]);

  const listBottomPadding =
    NATIVE_TAB_BAR_HEIGHT + insets.bottom + styles.sceneListContent.paddingBottom;
  const isLoadingSites = sites.length === 0 && (isSiteSyncing || sitesUpdatedAt === undefined);

  const handleRefresh = useCallback(() => {
    if (isSyncing || !currentNoticeSlug) {
      return;
    }

    void Promise.all([refreshSites(), refreshNotices()]);
  }, [currentNoticeSlug, isSyncing, refreshNotices, refreshSites]);

  const handleNoticeIndexChange = useCallback(
    (index: number) => {
      const route = routes[index];
      if (!route || route.key === currentNoticeSlug) {
        return;
      }

      void setSelectedNoticeSlug(route.key);
      setVisitedSlugs((prev) => {
        const next = new Set(prev);
        next.add(route.key);
        return next;
      });
    },
    [currentNoticeSlug, routes, setSelectedNoticeSlug],
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '공지사항',
          headerTitle: () => <></>,
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings/feed')} style={styles.settingButton}>
              <SettingsIcon color="white" size={24} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.root}>
        {isLoadingSites ? (
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <View style={styles.topInnerView}>
                <Header title="공지사항" />
                <ThemedText color="fgSecondary" typography="labelMd">
                  사이트별 전체 공지
                </ThemedText>
              </View>
            </View>
            <View style={styles.statusView}>
              <Image contentFit="contain" source={loadingImage} style={styles.imageView} />
              <ThemedText typography="headingLg">공지 목록을 가져오는 중이에요.</ThemedText>
              <ThemedText color="fgSecondary" typography="bodyLg">
                잠시만 기다려주세요.
              </ThemedText>
            </View>
          </SafeContainer>
        ) : siteError && routes.length === 0 ? (
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <View style={styles.topInnerView}>
                <Header title="공지사항" />
                <ThemedText color="fgSecondary" typography="labelMd">
                  사이트별 전체 공지
                </ThemedText>
              </View>
            </View>
            <View style={styles.statusView}>
              <Image contentFit="contain" source={errorImage} style={styles.imageView} />
              <ThemedText color="error" typography="headingLg">
                공지 목록을 불러오지 못했어요.
              </ThemedText>
              <Button onPress={() => void refreshSites()} variant="primary">
                다시 시도
              </Button>
            </View>
          </SafeContainer>
        ) : routes.length === 0 ? (
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <View style={styles.topInnerView}>
                <Header title="공지사항" />
                <ThemedText color="fgSecondary" typography="labelMd">
                  사이트별 전체 공지
                </ThemedText>
              </View>
            </View>
            <View style={styles.statusView}>
              <Image contentFit="contain" source={emptyImage} style={styles.imageView} />
              <ThemedText typography="headingLg">선택 가능한 공지 소스가 없어요</ThemedText>
              <ThemedText color="fgSecondary" typography="bodyLg">
                우측 상단 설정 버튼을 눌러 소스를 선택해주세요
              </ThemedText>
            </View>
          </SafeContainer>
        ) : (
          <CollapsibleTabs.Container
            index={navigationState.index}
            onIndexChange={handleNoticeIndexChange}
            onRefresh={handleRefresh}
            pullDistance={pullDistance}
            refreshing={isSyncing}
            renderHeader={() => (
              <SafeContainer edges={{ top: 'additive' }} style={styles.topView}>
                {Platform.OS === 'ios' && <Space gap={2} />}
                <View style={styles.topInnerView}>
                  <Header title="공지사항" />
                  <ThemedText color="fgSecondary" typography="labelMd">
                    사이트별 전체 공지
                  </ThemedText>
                </View>
              </SafeContainer>
            )}
            renderTabBar={(props: React.ComponentProps<typeof TabsTabBar<TabsRoute>>) => (
              <TabsTabBar {...props} />
            )}
            routes={routes}
          >
            {routes.map((route) => (
              <CollapsibleTabs.Scene key={route.key} routeKey={route.key}>
                {loadedSlugs.has(route.key) ? (
                  <FeedNoticeTabScene
                    error={route.key === currentNoticeSlug ? error : undefined}
                    isSyncing={isSyncing}
                    listContentContainerStyle={[
                      styles.sceneListContent,
                      { paddingBottom: listBottomPadding },
                    ]}
                    onScroll={
                      route.key === currentNoticeSlug
                        ? (event) => {
                            scrollY.value = event.nativeEvent.contentOffset.y;
                          }
                        : undefined
                    }
                    slug={route.key}
                  />
                ) : null}
              </CollapsibleTabs.Scene>
            ))}
          </CollapsibleTabs.Container>
        )}
        <FloatingHeader label="사이트별 전체 공지" scrollY={scrollY} title="공지사항" />
        <RefreshHeader pullDistance={pullDistance} refreshState={refreshState} />
      </View>
    </>
  );
}
