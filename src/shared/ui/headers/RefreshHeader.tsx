import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { Wave } from '@/shared/ui/Wave';

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    width: '100%',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  refreshHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
    backgroundColor: theme.colors.primary,
    zIndex: 10, // NOTE: RefreshHeader should be above all content (e.g. FloatingHeader)
    elevation: 10,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 20,
    overflow: 'visible',
    zIndex: 10,
    elevation: 10,
  },
}));

export const RefreshState = { Idle: 0, Syncing: 1 } as const;
export type RefreshState = (typeof RefreshState)[keyof typeof RefreshState];

// Internal phases (discrete, only integer values)
const Phase = {
  Idle: 0,
  Syncing: 1,
  Completing: 2,
} as const;
type Phase = (typeof Phase)[keyof typeof Phase];

interface RefreshHeaderProps {
  pullDistance: SharedValue<number>;
  refreshState: SharedValue<RefreshState>;
}

export function RefreshHeader({ refreshState, pullDistance }: RefreshHeaderProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const phase = useSharedValue<Phase>(Phase.Idle);
  const waveOffset = useSharedValue(0);

  // Separate animated properties for smooth transitions
  const headerOpacity = useSharedValue(0);
  const headerHeight = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(0);

  useAnimatedReaction(
    () => refreshState.value,
    (current, previous) => {
      if (current === RefreshState.Syncing && previous !== RefreshState.Syncing) {
        // Capture current pull-based values as starting point for seamless transition
        const currentOpacity = interpolate(
          pullDistance.value,
          [0, 80],
          [0, 1],
          Extrapolation.CLAMP,
        );
        const currentHeight = interpolate(
          pullDistance.value,
          [0, 1, 120],
          [0, insets.top, 120],
          Extrapolation.CLAMP,
        );
        const currentContentOpacity = interpolate(
          pullDistance.value,
          [0, 40, 80],
          [0, 0.5, 1],
          Extrapolation.CLAMP,
        );
        const currentContentTranslateY = interpolate(
          pullDistance.value,
          [0, 80],
          [-20, 0],
          Extrapolation.CLAMP,
        );

        // Set starting values from current pull state
        headerOpacity.value = currentOpacity;
        headerHeight.value = currentHeight;
        headerTranslateY.value = 0;
        contentOpacity.value = currentContentOpacity;
        contentTranslateY.value = currentContentTranslateY;

        phase.value = Phase.Syncing;
        waveOffset.value = withRepeat(
          withTiming(1, { duration: 1500, easing: Easing.linear }),
          -1,
          false,
        );
        // Animate from current pull values to sync targets
        headerOpacity.value = withTiming(1, { duration: 200 });
        headerHeight.value = withSpring(insets.top + 36, { damping: 20, stiffness: 200 });
        contentOpacity.value = withTiming(1, { duration: 200 });
        contentTranslateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      } else if (current === RefreshState.Idle && previous === RefreshState.Syncing) {
        waveOffset.value = withTiming(0, { duration: 300 });
        phase.value = Phase.Completing;
        // After 500ms delay, fade out over 300ms, then reset phase to Idle
        headerOpacity.value = withDelay(
          500,
          withTiming(0, { duration: 300 }, (finished) => {
            if (finished) {
              phase.value = Phase.Idle;
            }
          }),
        );
        headerHeight.value = withDelay(500, withTiming(0, { duration: 300 }));
        headerTranslateY.value = withDelay(500, withTiming(-insets.top - 36, { duration: 300 }));
        contentOpacity.value = withDelay(500, withTiming(0, { duration: 300 }));
      }
    },
    [],
  );

  const refreshHeaderAnimatedStyle = useAnimatedStyle(() => {
    if (phase.value !== Phase.Idle) {
      return {
        opacity: headerOpacity.value,
        height: headerHeight.value,
        transform: [{ translateY: headerTranslateY.value }],
      };
    }

    const pullOpacity = interpolate(pullDistance.value, [0, 80], [0, 1], Extrapolation.CLAMP);
    const pullHeight = interpolate(
      pullDistance.value,
      [0, 1, 120],
      [0, insets.top, 120],
      Extrapolation.CLAMP,
    );

    return {
      opacity: pullOpacity,
      height: pullHeight,
      transform: [{ translateY: 0 }],
    };
  });

  const refreshContentStyle = useAnimatedStyle(() => {
    if (phase.value !== Phase.Idle) {
      return {
        transform: [{ translateY: contentTranslateY.value }],
        opacity: contentOpacity.value,
      };
    }

    const pullTranslateY = interpolate(pullDistance.value, [0, 80], [-20, 0], Extrapolation.CLAMP);
    const pullOpacity = interpolate(
      pullDistance.value,
      [0, 40, 80],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: pullTranslateY }],
      opacity: pullOpacity,
    };
  });

  const waveAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: -windowWidth * waveOffset.value }],
    };
  });

  const pullTextStyle = useAnimatedStyle(() => ({
    opacity: phase.value === Phase.Idle ? 1 : 0,
    position: phase.value === Phase.Idle ? 'relative' : 'absolute',
    overflow: 'hidden',
  }));

  const syncTextStyle = useAnimatedStyle(() => ({
    opacity: phase.value === Phase.Syncing ? 1 : 0,
    position: phase.value === Phase.Syncing ? 'relative' : 'absolute',
    overflow: 'hidden',
  }));

  const completeTextStyle = useAnimatedStyle(() => ({
    opacity: phase.value === Phase.Completing ? 1 : 0,
    position: phase.value === Phase.Completing ? 'relative' : 'absolute',
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={[styles.refreshHeader, refreshHeaderAnimatedStyle]}>
      <SafeAreaView edges={{ top: 'additive' }} style={styles.safeArea}>
        <Animated.View style={refreshContentStyle}>
          <Animated.View style={pullTextStyle}>
            <ThemedText color="fgPrimary" typography="bodyMd">
              당겨서 새로고침
            </ThemedText>
          </Animated.View>
          <Animated.View style={syncTextStyle}>
            <ThemedText color="fgPrimary" typography="bodyMd">
              불러오는 중...
            </ThemedText>
          </Animated.View>
          <Animated.View style={completeTextStyle}>
            <ThemedText color="fgPrimary" typography="bodyMd">
              새로고침 완료!
            </ThemedText>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
      <Animated.View style={[styles.waveContainer, waveAnimatedStyle]}>
        <Wave height="20" style={{ marginTop: 20 }} width="200%" />
      </Animated.View>
    </Animated.View>
  );
}
