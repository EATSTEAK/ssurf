import { useEffect } from 'react';
import { RefreshControl, RefreshControlProps, ScrollView, ScrollViewProps } from 'react-native';
import Animated, {
  AnimatedProps,
  ScrollHandlerProcessed,
  useAnimatedScrollHandler,
  useComposedEventHandler,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { RefreshHeader, RefreshState } from '@/shared/ui/headers/RefreshHeader';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const styles = StyleSheet.create((theme) => ({
  scrollView: {
    gap: theme.gap(2),
    backgroundColor: theme.colors.surface,
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const RefreshableScrollView = ({
  refreshing,
  onRefresh,
  progressViewOffset,
  contentContainerStyle,
  onScroll,
  ...props
}: Omit<AnimatedProps<ScrollViewProps>, 'refreshControl'> &
  RefreshControlProps & { onScroll?: ScrollHandlerProcessed }) => {
  const pullDistance = useSharedValue(0);
  const refreshState = useSharedValue<RefreshState>(RefreshState.Idle);

  useEffect(() => {
    refreshState.value = refreshing ? RefreshState.Syncing : RefreshState.Idle;
  }, [refreshing, refreshState]);

  useEffect(() => {
    if (!refreshing) {
      pullDistance.value = withSpring(0);
    }
  }, [refreshing, pullDistance]);

  const refreshScrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        if (event.contentOffset.y < 0 && !refreshing) {
          // eslint-disable-next-line react-hooks/immutability
          pullDistance.value = Math.abs(event.contentOffset.y);
        } else if (event.contentOffset.y >= 0) {
          pullDistance.value = 0;
        }
      },
      onEndDrag: () => {
        if (!refreshing) {
          // eslint-disable-next-line react-hooks/immutability
          pullDistance.value = withSpring(0);
        }
      },
      onMomentumEnd: () => {
        if (!refreshing) {
          // eslint-disable-next-line react-hooks/immutability
          pullDistance.value = withSpring(0);
        }
      },
    },
    [refreshing],
  );

  const scrollHandler = useComposedEventHandler([refreshScrollHandler, onScroll ?? null]);

  return (
    <>
      <AnimatedScrollView
        contentContainerStyle={
          contentContainerStyle ? [styles.scrollView, contentContainerStyle] : styles.scrollView
        }
        onScroll={scrollHandler}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            progressViewOffset={progressViewOffset}
            refreshing={refreshing}
            style={{ visibility: 'hidden' }}
          />
        }
        scrollEventThrottle={16}
        {...props}
      />
      <RefreshHeader pullDistance={pullDistance} refreshState={refreshState} />
    </>
  );
};
