import { useEffect, useRef, useState } from 'react';
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

import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { Wave } from '@/shared/ui/Wave';

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
  const isShowing = useSharedValue(isSyncing);
  const animatingOut = useSharedValue(false);
  const prevIsSyncingRef = useRef(isSyncing);
  const waveOffset = useSharedValue(0);
  const [showingComplete, setShowingComplete] = useState(false);

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

    if (isSyncing) {
      // sync 시작 시 즉시 표시
      isShowing.value = true;
      animatingOut.value = false;
    } else if (wasSyncing && !isSyncing && animatingOut.value === false) {
      // isSyncing이 false가 되었을 때 "새로고침 완료!" 표시 (비동기)
      const completeShowTimer = setTimeout(() => {
        setShowingComplete(true);
      }, 0);

      // 500ms 후 완료 메시지 숨기고 사라지는 애니메이션 시작
      const completeTimer = setTimeout(() => {
        setShowingComplete(false);
        animatingOut.value = true;
      }, 500);

      // 800ms 후 isShowing과 애니메이션 상태 리셋
      const animationTimer = setTimeout(() => {
        isShowing.value = false;
        animatingOut.value = false;
      }, 800);

      return () => {
        clearTimeout(completeShowTimer);
        clearTimeout(completeTimer);
        clearTimeout(animationTimer);
      };
    }
  }, [animatingOut, isSyncing, isShowing]);

  const refreshHeaderAnimatedStyle = useAnimatedStyle(() => {
    const pullOpacity = interpolate(pullDistance.value, [0, 80], [0, 1], Extrapolation.CLAMP);
    const height = interpolate(
      pullDistance.value,
      [0, 1, 120],
      [0, insets.top, 120],
      Extrapolation.CLAMP,
    );

    // isShowing이 true일 때 (syncing 중이거나 완료 메시지 표시 중)
    if (isShowing.value && !animatingOut.value) {
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

    if (isShowing.value && !animatingOut.value) {
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
            {showingComplete ? '새로고침 완료!' : isSyncing ? '불러오는 중...' : '당겨서 새로고침'}
          </ThemedText>
        </Animated.View>
      </SafeAreaView>
      <Animated.View style={[styles.waveContainer, waveAnimatedStyle, refreshContentStyle]}>
        <Wave height="20" style={{ marginTop: 20 }} width="200%" />
      </Animated.View>
    </Animated.View>
  );
}
