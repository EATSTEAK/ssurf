import { ReactNode, useState } from 'react';
import { View } from 'react-native';
import { AnimatedHeaderBase, WithCollapsibleHeaderProps } from 'react-native-header-motion';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  header: {
    width: '100%',
    backgroundColor: theme.colors.surface,
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
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);

  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(progress.value, [0, 0.85, 1], [1, 0.08, 0], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 1],
            [0, -Math.max(headerHeight, progressThreshold + insets.top)],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }),
    [headerHeight, insets.top, progressThreshold],
  );

  return (
    <AnimatedHeaderBase
      onLayout={(event) => {
        const nextHeight = event.nativeEvent.layout.height;
        measureTotalHeight(event);
        setHeaderHeight((prevHeight) => (prevHeight === nextHeight ? prevHeight : nextHeight));
        onMeasuredHeight(nextHeight);
      }}
      style={[styles.header, { paddingTop: insets.top }, animatedStyle]}
    >
      <Animated.View onLayout={measureDynamic} style={styles.content}>
        {renderHeader({ progress })}
      </Animated.View>
      <View style={styles.tabBar}>{renderTabBar}</View>
    </AnimatedHeaderBase>
  );
}
