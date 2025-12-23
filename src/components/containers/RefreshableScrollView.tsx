import { RefreshControl, RefreshControlProps, ScrollView, ScrollViewProps } from 'react-native';
import Animated, {
  AnimatedProps,
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { RefreshHeader } from '@/components/headers/RefreshHeader';

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
}: Omit<AnimatedProps<ScrollViewProps>, 'refreshControl'> & RefreshControlProps) => {
  const pullDistance = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        if (event.contentOffset.y < 0 && !refreshing) {
          pullDistance.value = Math.abs(event.contentOffset.y);
        } else if (event.contentOffset.y >= 0) {
          pullDistance.value = 0;
        }

        // 부모 onScroll 처리 (함수 또는 Reanimated handler 객체일 수 있음)
        if (onScroll) {
          if (typeof onScroll === 'function') {
            // @ts-expect-error - ReanimatedScrollEvent 타입 호환
            onScroll(event);
          } else if (typeof onScroll === 'object' && 'onScroll' in onScroll) {
            // @ts-expect-error - ReanimatedScrollEvent 타입 호환
            onScroll.onScroll?.(event);
          }
        }
      },
      onBeginDrag: (event) => {
        if (onScroll && typeof onScroll === 'object' && 'onBeginDrag' in onScroll) {
          // @ts-expect-error - ReanimatedScrollEvent 타입 호환
          onScroll.onBeginDrag?.(event);
        }
      },
      onEndDrag: (event) => {
        pullDistance.value = withSpring(0);
        if (onScroll && typeof onScroll === 'object' && 'onEndDrag' in onScroll) {
          // @ts-expect-error - ReanimatedScrollEvent 타입 호환
          onScroll.onEndDrag?.(event);
        }
      },
      onMomentumBegin: (event) => {
        if (onScroll && typeof onScroll === 'object' && 'onMomentumBegin' in onScroll) {
          // @ts-expect-error - ReanimatedScrollEvent 타입 호환
          onScroll.onMomentumBegin?.(event);
        }
      },
      onMomentumEnd: (event) => {
        if (onScroll && typeof onScroll === 'object' && 'onMomentumEnd' in onScroll) {
          // @ts-expect-error - ReanimatedScrollEvent 타입 호환
          onScroll.onMomentumEnd?.(event);
        }
      },
    },
    [refreshing, onScroll],
  );
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
      <RefreshHeader isSyncing={refreshing} pullDistance={pullDistance} />
    </>
  );
};
