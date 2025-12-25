import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/shared/ui/primitives/ThemedText';

export interface FloatingHeaderProps {
  label?: string;
  scrollY: SharedValue<number>;
  title: string;
}

const styles = StyleSheet.create((theme) => ({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    overflow: 'visible',
    zIndex: 1,
    elevation: 1,
  },
  headerGradient: {
    gradientColor: theme.colors.surfaceDim,
    width: '100%',
  },
  headerContent: {
    width: '100%',
    height: 118,
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
}));

export const FloatingHeader = ({ scrollY, title, label }: FloatingHeaderProps) => {
  // 일반 헤더 애니메이션
  const normalHeaderAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP);
    return {
      opacity,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 100], [20, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });
  return (
    <Animated.View style={[styles.header, normalHeaderAnimatedStyle]}>
      <LinearGradient
        colors={[styles.headerGradient.gradientColor, 'transparent']}
        end={{ x: 0.5, y: 1 }}
        start={{ x: 0.5, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={{ top: 'additive' }} style={styles.headerContent}>
          <Animated.View style={textAnimatedStyle}>
            <ThemedText typography="headingXl">{title}</ThemedText>
          </Animated.View>
          {label && (
            <Animated.View style={textAnimatedStyle}>
              <ThemedText typography="labelMd">{label}</ThemedText>
            </Animated.View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
};
