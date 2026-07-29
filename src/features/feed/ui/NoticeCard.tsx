import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { FeedNoticeListItem, FeedSiteEntity } from '@/entities/feed/model';
import { ArrowForwardIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { TabsRoute, TabsTabBar, useAutoHeightTabView } from '@/shared/ui/primitives/Tabs';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

import { FeedNoticeItem } from './FeedNoticeItem';

const NOTICE_PREVIEW_HEIGHT = 272;

const styles = StyleSheet.create((theme) => ({
  noticeSection: {
    paddingVertical: theme.gap(2),
    backgroundColor: theme.colors.surfaceDim,
    gap: theme.gap(1),
  },
  noticeTabs: {
    marginTop: theme.gap(0.5),
    marginBottom: theme.gap(0.5),
    paddingLeft: theme.gap(0.5),
    backgroundColor: theme.colors.surfaceDim,
  },
  noticeTabTrigger: (state: { isActive: boolean; pressed: boolean }) => ({
    backgroundColor: state.isActive
      ? state.pressed
        ? theme.colors.primaryContainer
        : theme.colors.primary
      : state.pressed
        ? theme.colors.surfaceDimmer
        : theme.colors.surface,
  }),
  noticeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(3),
  },
  noticeSectionTitle: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  noticeSectionAction: {
    width: 'auto',
    paddingHorizontal: theme.gap(2),
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  noticeContent: {
    backgroundColor: theme.colors.surfaceDim,
    gap: theme.gap(2),
  },
  noticeList: {
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceDim,
  },
  noticeScene: {
    width: '100%',
  },
  noticePreviewScene: {
    width: '100%',
    height: NOTICE_PREVIEW_HEIGHT,
  },
  noticeEmpty: {
    paddingVertical: theme.gap(4),
    paddingHorizontal: theme.gap(3),
    alignItems: 'center',
    gap: theme.gap(1),
  },
}));

const ThemedArrowForwardIcon = withUnistyles(ArrowForwardIcon, (theme) => ({
  color: theme.colorsHex.fgPrimary,
}));

type NoticeCardProps = {
  actionLabel?: string;
  currentNoticeSlug: string;
  error?: Error | null;
  itemsBySlug: Record<string, FeedNoticeListItem[]>;
  limit?: number;
  onPressAction?: () => void;
  onPressNotice: (item: FeedNoticeListItem) => void;
  onSelectNoticeSlug: (slug: string) => void;
  sites: FeedSiteEntity[];
  title?: string;
  width: number;
};

export const NoticeCard = memo(function NoticeCard({
  actionLabel,
  currentNoticeSlug,
  error,
  itemsBySlug,
  limit,
  onPressAction,
  onPressNotice,
  onSelectNoticeSlug,
  sites,
  title = '공지사항',
  width,
}: NoticeCardProps) {
  const isPreview = limit !== undefined;
  const routes = useMemo<TabsRoute[]>(
    () =>
      sites.map((site) => ({
        key: site.slug,
        title: site.title,
        triggerStyle: styles.noticeTabTrigger,
      })),
    [sites],
  );
  const noticeIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === currentNoticeSlug),
  );
  const navigationState = useMemo(() => ({ index: noticeIndex, routes }), [noticeIndex, routes]);
  const { handleSceneLayout, handleTabBarLayout, tabViewHeight } = useAutoHeightTabView(
    navigationState,
    isPreview ? NOTICE_PREVIEW_HEIGHT : undefined,
  );
  const shouldShowAction = !!actionLabel && !!onPressAction;

  const handleNoticeIndexChange = useCallback(
    (index: number) => {
      const route = routes[index];
      if (!route || route.key === currentNoticeSlug) {
        return;
      }

      onSelectNoticeSlug(route.key);
    },
    [currentNoticeSlug, onSelectNoticeSlug, routes],
  );

  const renderNoticeScene = useCallback(
    ({ route }: { route: TabsRoute }) => {
      const items = itemsBySlug[route.key] ?? [];
      const visibleItems = limit === undefined ? items : items.slice(0, limit);
      const sceneStyle = isPreview ? styles.noticePreviewScene : styles.noticeScene;

      return (
        <View onLayout={handleSceneLayout(route.key)} style={sceneStyle}>
          {visibleItems.length === 0 ? (
            <View style={styles.noticeEmpty}>
              <ThemedText typography="bodyMd">등록된 공지가 없어요</ThemedText>
            </View>
          ) : (
            <View style={styles.noticeList}>
              {visibleItems.map((item, index) => (
                <FeedNoticeItem
                  isLast={index === visibleItems.length - 1}
                  item={item}
                  key={`${item.slug}-${item.id}`}
                  onPress={onPressNotice}
                  titleNumberOfLines={isPreview ? 1 : undefined}
                />
              ))}
            </View>
          )}
        </View>
      );
    },
    [handleSceneLayout, isPreview, itemsBySlug, limit, onPressNotice],
  );

  return (
    <View style={styles.noticeSection}>
      <View style={styles.noticeSectionHeader}>
        <View style={styles.noticeSectionTitle}>
          <ThemedText typography="headingLg">{title}</ThemedText>
        </View>
        {shouldShowAction ? (
          <Button
            onPress={onPressAction}
            style={styles.noticeSectionAction}
            textStyle={{ fontSize: 14 }}
            variant="surface"
          >
            <View style={styles.sectionActionButton}>
              <ThemedText color="fgPrimary" typography="labelMd">
                {actionLabel}
              </ThemedText>
              <ThemedArrowForwardIcon size={16} />
            </View>
          </Button>
        ) : null}
      </View>

      {sites.length === 0 || routes.length === 0 ? (
        <View style={styles.noticeContent}>
          <View style={styles.noticeEmpty}>
            <ThemedText typography="bodyMd">선택 가능한 공지 소스가 없어요</ThemedText>
          </View>
        </View>
      ) : error ? (
        <View style={styles.noticeContent}>
          <View style={styles.noticeEmpty}>
            <ThemedText color="error" typography="bodyMd">
              공지사항을 불러오지 못했어요
            </ThemedText>
            <ThemedText color="fgSecondary" typography="bodySm">
              아래로 당겨 다시 시도해주세요
            </ThemedText>
          </View>
        </View>
      ) : (
        <View style={styles.noticeContent}>
          <TabView
            initialLayout={{ width }}
            navigationState={navigationState}
            onIndexChange={handleNoticeIndexChange}
            pagerStyle={{ marginTop: styles.noticeContent.gap }}
            renderScene={renderNoticeScene}
            renderTabBar={(props) => (
              <TabsTabBar {...props} listStyle={styles.noticeTabs} onLayout={handleTabBarLayout} />
            )}
            style={{ height: tabViewHeight + styles.noticeContent.gap }}
            swipeEnabled={routes.length > 1}
          />
        </View>
      )}
    </View>
  );
});
