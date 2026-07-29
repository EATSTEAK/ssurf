import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface ChapelSeatRippleProps {
  centerX: number;
  centerY: number;
  color: string;
  size: number;
}

export const ChapelSeatRipple = ({ centerX, centerY, color, size }: ChapelSeatRippleProps) => {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    progress.set(
      withRepeat(
        withTiming(1, {
          duration: 1600,
          easing: Easing.out(Easing.quad),
        }),
        -1,
      ),
    );

    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentProgress = progress.get();
    return {
      opacity: interpolate(currentProgress, [0, 1], [0.5, 0]),
      transform: [{ scale: interpolate(currentProgress, [0, 1], [0.7, 2.5]) }],
    };
  });

  if (reduceMotion) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          backgroundColor: 'transparent',
          borderColor: color,
          borderRadius: size / 2,
          borderWidth: 2,
          height: size,
          left: centerX - size / 2,
          position: 'absolute',
          top: centerY - size / 2,
          width: size,
        },
        animatedStyle,
      ]}
    />
  );
};
