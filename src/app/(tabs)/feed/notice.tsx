import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { FlatList, Platform, Pressable, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useFeedNotices, useFeedSites } from '@/entities/feed/lib/queries';
import { useSyncFeed } from '@/entities/feed/lib/sync';
import { FeedNoticeEntity } from '@/entities/feed/model';
import { FeedNoticeItem } from '@/features/feed/ui/FeedNoticeItem';
import { useExpoSecureStore } from '@/shared/lib/useExpoSecureStore';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { SettingsIcon } from '@/shared/ui/icons';
import { AutoHeightFlatList } from '@/shared/ui/primitives/AutoHeightFlatList';
import { Space } from '@/shared/ui/primitives/Space';
import { Tabs } from '@/shared/ui/primitives/Tabs';
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
  scrollContent: {
    paddingBottom: theme.gap(8),
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
  pageList: {
    backgroundColor: theme.colors.surfaceDim,
  },
  pageListContent: {
    paddingBottom: theme.gap(8),
  },
  pageContent: {
    width: '100%',
  },
  pageEmpty: {
    paddingVertical: theme.gap(6),
    paddingHorizontal: theme.gap(3),
    alignItems: 'center',
    gap: theme.gap(1),
    backgroundColor: theme.colors.surface,
  },
  settingButton: {
    padding: theme.gap(1),
    borderRadius: theme.cornerRadius.md,
  },
}));

type NoticePage = {
  slug: string;
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<FeedNoticeEntity>);

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
  const { sync, syncSites } = useSyncFeed(studentId ?? '');
  const noticeSites = useMemo(() => sites.filter((site) => site.kind === 'notice'), [sites]);
  const visibleNoticeSites = useMemo(
    () => noticeSites.filter((site) => selectedNoticeSlugs.includes(site.slug)),
    [noticeSites, selectedNoticeSlugs],
  );
  const currentNoticeSlug =
    visibleNoticeSites.find((site) => site.slug === selectedNoticeSlug)?.slug ??
    visibleNoticeSites[0]?.slug ??
    '';
  const currentNoticeSite =
    visibleNoticeSites.find((site) => site.slug === currentNoticeSlug) ?? null;
  const noticeListBottomPadding =
    NATIVE_TAB_BAR_HEIGHT + insets.bottom + styles.pageListContent.paddingBottom;

  useEffect(() => {
    void syncSites();
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

  const { data, error, isSyncing } = useFeedNotices(
    studentId ?? '',
    currentNoticeSlug ? [currentNoticeSlug] : [],
  );

  const pages = useMemo<NoticePage[]>(
    () =>
      visibleNoticeSites.map((site) => ({
        slug: site.slug,
      })),
    [visibleNoticeSites],
  );

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleRefresh = useCallback(() => {
    if (isSyncing || !currentNoticeSlug) {
      return;
    }

    void syncSites({ force: true });
    void sync([currentNoticeSlug], { force: true });
  }, [currentNoticeSlug, isSyncing, sync, syncSites]);

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

  const handlePressNotice = useCallback(
    (item: FeedNoticeEntity) => {
      void handleOpenUrl(item.url);
    },
    [handleOpenUrl],
  );

  const renderHeader = () => (
    <SafeContainer>
      {Platform.OS === 'ios' && <Space gap={2} />}
      <View style={styles.topView}>
        <View style={styles.topInnerView}>
          <Header title="공지사항" />
          <ThemedText color="fgSecondary" typography="labelMd">
            사이트별 전체 공지
          </ThemedText>
        </View>

        <View style={styles.tabsWrapper}>
          <Tabs.Root onValueChange={setSelectedNoticeSlug} value={currentNoticeSlug}>
            <Tabs.List>
              {visibleNoticeSites.map((site) => (
                <Tabs.Trigger key={site.slug} value={site.slug}>
                  <ThemedText typography="labelMd">{site.title}</ThemedText>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </View>
      </View>
    </SafeContainer>
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
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {renderHeader()}
          {visibleNoticeSites.length === 0 ? (
            <View style={styles.pageEmpty}>
              <ThemedText typography="bodyMd">선택 가능한 공지 소스가 없어요</ThemedText>
            </View>
          ) : (
            <AutoHeightFlatList
              data={pages}
              keyExtractor={(item) => item.slug}
              onPageChange={setSelectedNoticeSlug}
              renderItem={(page) => {
                const isActivePage = page.slug === currentNoticeSlug;

                if (!isActivePage) {
                  return <View style={styles.pageContent} />;
                }

                if (error) {
                  return (
                    <View style={styles.pageContent}>
                      <View style={styles.pageEmpty}>
                        <ThemedText color="error" typography="bodyMd">
                          공지사항을 불러오지 못했어요
                        </ThemedText>
                        <ThemedText color="fgSecondary" typography="bodySm">
                          아래로 당겨 다시 시도해주세요
                        </ThemedText>
                      </View>
                    </View>
                  );
                }

                if (data.length === 0 && !isSyncing) {
                  return (
                    <View style={styles.pageContent}>
                      <View style={styles.pageEmpty}>
                        <ThemedText typography="bodyMd">등록된 공지가 없어요</ThemedText>
                      </View>
                    </View>
                  );
                }

                return (
                  <View style={styles.pageContent}>
                    <AnimatedFlatList
                      contentContainerStyle={[
                        styles.pageListContent,
                        { paddingBottom: noticeListBottomPadding },
                      ]}
                      data={data}
                      initialNumToRender={8}
                      keyExtractor={(item) => `${item.slug}-${item.id}`}
                      maxToRenderPerBatch={8}
                      onRefresh={handleRefresh}
                      refreshing={isSyncing}
                      removeClippedSubviews
                      renderItem={({ index, item }) => (
                        <FeedNoticeItem
                          isLast={index === data.length - 1}
                          item={item}
                          onPress={handlePressNotice}
                        />
                      )}
                      style={styles.pageList}
                      updateCellsBatchingPeriod={50}
                      windowSize={5}
                    />
                  </View>
                );
              }}
              selectedKey={currentNoticeSlug}
            />
          )}
        </Animated.ScrollView>
        <FloatingHeader
          label={currentNoticeSite?.title ?? '공지사항'}
          scrollY={scrollY}
          title="공지사항"
        />
      </View>
    </>
  );
}
