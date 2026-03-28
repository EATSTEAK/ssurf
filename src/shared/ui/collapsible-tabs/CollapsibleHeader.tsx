import { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { AnimatedHeaderBase, WithCollapsibleHeaderProps } from 'react-native-header-motion';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  header: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    zIndex: 1,
  },
  content: {
    gap: theme.gap(1),
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
  },
}));

type CollapsibleHeaderProps = WithCollapsibleHeaderProps & {
  onMeasuredHeight: (height: number) => void;
  renderHeader: (props: { progress: WithCollapsibleHeaderProps['progress'] }) => ReactNode;
  renderTabBar: ReactNode;
};

export function CollapsibleHeader({
  measureDynamic,
  measureTotalHeight,
  onMeasuredHeight,
  progress,
  progressThreshold,
  renderHeader,
  renderTabBar,
}: CollapsibleHeaderProps) {
  const threshold = useSharedValue(0);

  useEffect(() => {
    if (Number.isFinite(progressThreshold)) {
      threshold.value = progressThreshold;
    }
  }, [progressThreshold, threshold]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.85, 1], [1, 0.08, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [0, -threshold.value], Extrapolation.CLAMP),
      },
    ],
  }));

  const animatedProps = useAnimatedProps((): { pointerEvents: 'auto' | 'none' } => ({
    pointerEvents: progress.value > 0.95 ? 'none' : 'auto',
  }));

  return (
    <AnimatedHeaderBase
      animatedProps={animatedProps}
      onLayout={(event) => {
        measureTotalHeight(event);
        onMeasuredHeight(event.nativeEvent.layout.height);
      }}
      style={[styles.header, animatedStyle]}
    >
      <Animated.View onLayout={measureDynamic} style={styles.content}>
        {renderHeader({ progress })}
      </Animated.View>
      <View style={styles.tabBar}>{renderTabBar}</View>
    </AnimatedHeaderBase>
  );
}
