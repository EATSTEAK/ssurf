import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  RefreshControlProps,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
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
  ...props
}: Omit<AnimatedProps<ScrollViewProps>, 'refreshControl'> & RefreshControlProps) => {
  const pullDistance = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (event.contentOffset.y < 0 && !refreshing) {
        pullDistance.value = Math.abs(event.contentOffset.y);
      } else if (event.contentOffset.y >= 0) {
        pullDistance.value = 0;
      }
    },
    onEndDrag: () => {
      pullDistance.value = withSpring(0);
    },
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollHandler(event);
    if (props.onScroll) {
      if (typeof props.onScroll === 'function') {
        props.onScroll(event);
      } else {
        props.onScroll.get()?.(event);
      }
    }
  };
  return (
    <>
      <AnimatedScrollView
        contentContainerStyle={[styles.scrollView, contentContainerStyle]}
        onScroll={handleScroll}
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
