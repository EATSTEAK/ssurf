import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useFeedSites } from '@/entities/feed/lib/queries';
import { useSyncFeed } from '@/entities/feed/lib/sync';
import { FeedNoticeTabScene } from '@/features/feed/ui/FeedNoticeTabScene';
import { useExpoSecureStore } from '@/shared/lib/useExpoSecureStore';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { CollapsibleTabs } from '@/shared/ui/collapsible-tabs/CollapsibleTabs';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { Header } from '@/shared/ui/headers/Header';
import { RefreshHeader } from '@/shared/ui/headers/RefreshHeader';
import { SettingsIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';
import { TabsRoute, TabsTabBar } from '@/shared/ui/primitives/Tabs';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const DEFAULT_NOTICE_SLUG = 'scatch.ssu.ac.kr';
const DEFAULT_SELECTED_NOTICE_SLUGS = [DEFAULT_NOTICE_SLUG];
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
  const { studentId } = useRusaintApplication();
  const [selectedNoticeSlugs, setSelectedNoticeSlugs] = useExpoSecureStore<string[]>({
    key: 'feed.selectedNoticeSlugs',
    defaultValue: DEFAULT_SELECTED_NOTICE_SLUGS,
  });
  const [selectedNoticeSlug, setSelectedNoticeSlug] = useExpoSecureStore<string>({
    key: 'feed.selectedNoticeSlug',
    defaultValue: DEFAULT_NOTICE_SLUG,
  });

  const { data: sites } = useFeedSites();
  const { error, isSyncing, syncEntry, syncSites } = useSyncFeed(studentId ?? '');
  const pullDistance = useSharedValue(0);
  const [hasBootstrappedSites, setHasBootstrappedSites] = useState(sites.length > 0);
  const noticeSites = useMemo(() => sites.filter((site) => site.kind === 'notice'), [sites]);
  const visibleNoticeSites = useMemo(
    () => noticeSites.filter((site) => selectedNoticeSlugs.includes(site.slug)),
    [noticeSites, selectedNoticeSlugs],
  );

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      await syncSites();
      if (isMounted) {
        setHasBootstrappedSites(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [syncSites]);

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

  const listBottomPadding =
    NATIVE_TAB_BAR_HEIGHT + insets.bottom + styles.sceneListContent.paddingBottom;
  const isLoadingSites = !hasBootstrappedSites && sites.length === 0;

  const handleRefresh = useCallback(() => {
    if (isSyncing || !currentNoticeSlug) {
      return;
    }

    void syncSites({ force: true });
    void syncEntry(currentNoticeSlug, { force: true });
  }, [currentNoticeSlug, isSyncing, syncEntry, syncSites]);

  const handleNoticeIndexChange = useCallback(
    (index: number) => {
      const route = routes[index];
      if (!route || route.key === currentNoticeSlug) {
        return;
      }

      void setSelectedNoticeSlug(route.key);
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
            <Pressable onPress={() => router.push('/feed/settings')} style={styles.settingButton}>
              <SettingsIcon color="white" size={24} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.root}>
        <SafeContainer>
          {Platform.OS === 'ios' && <Space gap={2} />}
          {isLoadingSites ? (
            <View style={styles.emptyState}>
              <ThemedText color="fgSecondary" typography="bodyMd">
                공지 소스를 불러오는 중이에요
              </ThemedText>
            </View>
          ) : routes.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText typography="bodyMd">선택 가능한 공지 소스가 없어요</ThemedText>
            </View>
          ) : (
            <CollapsibleTabs.Container
              index={navigationState.index}
              onIndexChange={handleNoticeIndexChange}
              onRefresh={handleRefresh}
              pullDistance={pullDistance}
              refreshing={isSyncing}
              renderHeader={() => (
                <View style={styles.topView}>
                  <View style={styles.topInnerView}>
                    <Header title="공지사항" />
                    <ThemedText color="fgSecondary" typography="labelMd">
                      사이트별 전체 공지
                    </ThemedText>
                  </View>
                </View>
              )}
              renderTabBar={(props: React.ComponentProps<typeof TabsTabBar<TabsRoute>>) => (
                <TabsTabBar {...props} />
              )}
              routes={routes}
            >
              {routes.map((route) => (
                <CollapsibleTabs.Scene key={route.key} routeKey={route.key}>
                  <FeedNoticeTabScene
                    error={route.key === currentNoticeSlug ? error : undefined}
                    isSyncing={isSyncing}
                    listContentContainerStyle={[
                      styles.sceneListContent,
                      { paddingBottom: listBottomPadding },
                    ]}
                    slug={route.key}
                  />
                </CollapsibleTabs.Scene>
              ))}
            </CollapsibleTabs.Container>
          )}
          <RefreshHeader isSyncing={isSyncing} pullDistance={pullDistance} />
        </SafeContainer>
      </View>
    </>
  );
}
