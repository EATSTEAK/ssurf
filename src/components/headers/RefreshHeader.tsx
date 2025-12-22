import { useEffect, useRef } from 'react';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';
import { Wave } from '@/components/shared/Wave';

const styles = StyleSheet.create((theme) => ({
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
  },
}));

interface RefreshHeaderProps {
  isSyncing: boolean;
  pullDistance: SharedValue<number>;
}

export function RefreshHeader({ pullDistance, isSyncing }: RefreshHeaderProps) {
  const insets = useSafeAreaInsets();
  const animatingOut = useSharedValue(false);
  const prevIsSyncingRef = useRef(isSyncing);
  const waveOffset = useSharedValue(0);

  useEffect(() => {
    if (isSyncing) {
      // isSyncing 중에는 파도 애니메이션 시작
      waveOffset.value = withRepeat(
        withTiming(100, {
          duration: 1500,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    } else {
      // isSyncing이 아닐 때는 애니메이션 정지
      waveOffset.value = withTiming(0, { duration: 300 });
    }
  }, [isSyncing, waveOffset]);

  useEffect(() => {
    const wasSyncing = prevIsSyncingRef.current;
    prevIsSyncingRef.current = isSyncing;

    if (wasSyncing && !isSyncing && animatingOut.value === false) {
      // isSyncing이 false가 되었을 때 애니메이션 시작
      animatingOut.value = true;

      // 애니메이션이 끝난 후 상태 리셋
      const timer = setTimeout(() => {
        animatingOut.value = false;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [animatingOut, isSyncing]);

  const refreshHeaderAnimatedStyle = useAnimatedStyle(() => {
    const pullOpacity = interpolate(pullDistance.value, [0, 80], [0, 1], Extrapolation.CLAMP);
    const height = interpolate(
      pullDistance.value,
      [0, 1, 120],
      [0, insets.top, 120],
      Extrapolation.CLAMP,
    );

    // syncing 중일 때
    if (isSyncing) {
      return {
        opacity: withTiming(1, { duration: 200 }),
        height: withSpring(insets.top + 36, { damping: 20, stiffness: 200 }),
        transform: [{ translateY: withTiming(0, { duration: 200 }) }],
      };
    }

    // syncing이 막 끝났을 때 - 위로 올라가면서 fade out
    if (animatingOut.value) {
      return {
        opacity: withTiming(0, { duration: 300 }),
        height: withTiming(0, { duration: 300 }),
        transform: [{ translateY: withTiming(-insets.top - 36, { duration: 300 }) }],
      };
    }

    // 일반적인 pull 상태
    return {
      opacity: pullOpacity,
      height,
      transform: [{ translateY: 0 }],
    };
  });

  const refreshContentStyle = useAnimatedStyle(() => {
    const translateY = interpolate(pullDistance.value, [0, 80], [-20, 0], Extrapolation.CLAMP);
    const opacity = interpolate(pullDistance.value, [0, 40, 80], [0, 0.5, 1], Extrapolation.CLAMP);

    if (isSyncing) {
      return {
        transform: [{ translateY: withSpring(0, { damping: 20, stiffness: 200 }) }],
        opacity: withTiming(1, { duration: 200 }),
      };
    }

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const waveAnimatedStyle = useAnimatedStyle(() => {
    if (isSyncing) {
      return {
        transform: [{ translateX: `${-waveOffset.value}%` }],
      };
    }
    return {
      transform: [{ translateX: 0 }],
    };
  });

  return (
    <Animated.View style={[styles.refreshHeader, refreshHeaderAnimatedStyle]}>
      <SafeAreaView
        edges={{ top: 'additive' }}
        style={{
          width: '100%',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 4,
        }}
      >
        <Animated.View style={refreshContentStyle}>
          <ThemedText color="fgPrimary" typography="bodyMd">
            {isSyncing ? '불러오는 중...' : '당겨서 새로고침'}
          </ThemedText>
        </Animated.View>
      </SafeAreaView>
      <Animated.View style={[styles.waveContainer, waveAnimatedStyle, refreshContentStyle]}>
        <Wave height="20" style={{ marginTop: 20 }} width="200%" />
      </Animated.View>
    </Animated.View>
  );
}
