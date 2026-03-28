import { PropsWithChildren } from 'react';
import { RefreshControl, RefreshControlProps, ScrollViewProps, View } from 'react-native';
import HeaderMotion from 'react-native-header-motion';
import Animated, {
  AnimatedProps,
  ScrollHandlerProcessed,
  useAnimatedScrollHandler,
  useComposedEventHandler,
  withSpring,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useCollapsibleSceneKey, useCollapsibleTabsContext } from './CollapsibleTabsContext';

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    overflow: 'visible',
  },
}));

type CollapsibleScrollViewProps = Omit<AnimatedProps<ScrollViewProps>, 'refreshControl'> &
  RefreshControlProps & {
    onScroll?: ScrollHandlerProcessed;
    scrollId?: string;
  };

type ScrollableContentProps = PropsWithChildren<{
  contentContainerStyle?: AnimatedProps<ScrollViewProps>['contentContainerStyle'];
  extraProps: Omit<
    CollapsibleScrollViewProps,
    | 'contentContainerStyle'
    | 'onMomentumScrollBegin'
    | 'onMomentumScrollEnd'
    | 'onRefresh'
    | 'onScroll'
    | 'onScrollBeginDrag'
    | 'onScrollEndDrag'
    | 'progressViewOffset'
    | 'refreshing'
    | 'scrollEventThrottle'
    | 'scrollId'
  >;
  managedOnScroll: ScrollHandlerProcessed;
  minHeightContentContainerStyle: AnimatedProps<ScrollViewProps>['contentContainerStyle'];
  originalHeaderHeight: number;
  progressViewOffset?: number;
  refreshScrollHandler: ScrollHandlerProcessed;
  resolvedOnRefresh?: () => void;
  resolvedRefreshing: boolean;
  scrollableProps: Omit<AnimatedProps<ScrollViewProps>, 'onScroll'>;
  scrollEventThrottle?: number;
  showsVerticalScrollIndicator: boolean;
}>;

function ScrollableContent({
  children,
  contentContainerStyle,
  extraProps,
  managedOnScroll,
  minHeightContentContainerStyle,
  originalHeaderHeight,
  progressViewOffset,
  refreshScrollHandler,
  resolvedOnRefresh,
  resolvedRefreshing,
  scrollEventThrottle,
  scrollableProps,
  showsVerticalScrollIndicator,
}: ScrollableContentProps) {
  const composedOnScroll = useComposedEventHandler([managedOnScroll, refreshScrollHandler]);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        {...extraProps}
        {...scrollableProps}
        onScroll={composedOnScroll}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={
          <RefreshControl
            onRefresh={resolvedOnRefresh}
            progressViewOffset={progressViewOffset ?? originalHeaderHeight}
            refreshing={resolvedRefreshing}
            style={{ visibility: 'hidden' }}
          />
        }
        scrollEventThrottle={scrollEventThrottle ?? 16}
      >
        <Animated.View
          style={[
            minHeightContentContainerStyle,
            { paddingTop: originalHeaderHeight },
            contentContainerStyle,
          ]}
        >
          {children}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

export function CollapsibleScrollView({
  children,
  contentContainerStyle,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onRefresh,
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  progressViewOffset,
  refreshing,
  scrollEventThrottle,
  scrollId,
  ...props
}: CollapsibleScrollViewProps) {
  const resolvedScrollId = useCollapsibleSceneKey(scrollId);
  const {
    activeIndex,
    isSwiping,
    onRefresh: containerOnRefresh,
    pullDistance,
    refreshing: containerRefreshing,
    routes,
  } = useCollapsibleTabsContext();
  const resolvedOnRefresh = onRefresh ?? containerOnRefresh;
  const resolvedRefreshing = refreshing || containerRefreshing;
  const activeRouteKey = routes[activeIndex]?.key;
  const isActiveScene = resolvedScrollId === activeRouteKey;

  const refreshScrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        if (!isActiveScene) {
          return;
        }

        if (event.contentOffset.y < 0 && !resolvedRefreshing) {
          // eslint-disable-next-line react-hooks/immutability
          pullDistance.value = Math.abs(event.contentOffset.y);
        } else if (event.contentOffset.y >= 0) {
          pullDistance.value = 0;
        }
      },
      onEndDrag: () => {
        if (!isActiveScene) {
          return;
        }

        if (!resolvedRefreshing) {
          // eslint-disable-next-line react-hooks/immutability
          pullDistance.value = withSpring(0);
        }
      },
      onMomentumEnd: () => {
        if (!isActiveScene) {
          return;
        }

        if (!resolvedRefreshing) {
          // eslint-disable-next-line react-hooks/immutability
          pullDistance.value = withSpring(0);
        }
      },
    },
    [isActiveScene, resolvedRefreshing],
  );

  return (
    <HeaderMotion.ScrollManager
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onRefresh={resolvedOnRefresh}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      refreshing={resolvedRefreshing}
      scrollId={resolvedScrollId}
    >
      {(
        { onScroll: managedOnScroll, ...scrollableProps },
        { minHeightContentContainerStyle, originalHeaderHeight },
      ) => (
        <ScrollableContent
          contentContainerStyle={contentContainerStyle}
          extraProps={props}
          managedOnScroll={managedOnScroll}
          minHeightContentContainerStyle={minHeightContentContainerStyle}
          originalHeaderHeight={originalHeaderHeight}
          progressViewOffset={progressViewOffset}
          refreshScrollHandler={refreshScrollHandler}
          resolvedOnRefresh={resolvedOnRefresh}
          resolvedRefreshing={resolvedRefreshing}
          scrollableProps={scrollableProps}
          scrollEventThrottle={
            typeof scrollEventThrottle === 'number' ? scrollEventThrottle : undefined
          }
          showsVerticalScrollIndicator={!isSwiping}
        >
          {children}
        </ScrollableContent>
      )}
    </HeaderMotion.ScrollManager>
  );
}
