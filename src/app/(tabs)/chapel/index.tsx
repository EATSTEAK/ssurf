import { SemesterType } from '@rusaint/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { Attendance } from '@/components/chapel/Attendance';
import { ChapelProgress } from '@/components/chapel/ChapelProgress';
import { ChapelSeatmapView } from '@/components/chapel/ChapelSeatmapView';
import { Space } from '@/components/primitives/Space';
import { ThemedText } from '@/components/primitives/ThemedText';
import { RefreshHeader } from '@/components/RefreshHeader';
import { useChapelAttendances, useGeneralChapelInformation } from '@/hooks/chapel/chapel';
import { useSyncChapel } from '@/hooks/sync/useSyncChapel';
import { SsurfLined } from '@/icons/SsurfLined';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: theme.gap(2),
    width: '100%',
    position: 'relative',
  },
  topView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'column',
    padding: theme.gap(2),
  },
  titleContainer: { display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' },
  scrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
  contentView: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
  },
  seatView: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'column',
    backgroundColor: theme.colors.surfaceDim,
    padding: theme.gap(2),
  },
  attendanceView: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.surfaceDim,
  },
  bottomView: {
    width: '100%',
    paddingHorizontal: theme.gap(2),
    backgroundColor: theme.colors.surface,
  },
  header: { position: 'absolute', top: 0, left: 0, width: '100%', overflow: 'visible' },
  gradientHeader: {
    width: '100%',
  },
}));

const doorDirection = (floor: number, seat: string) => {
  switch (seat.charAt(0)) {
    case 'A':
    case 'B':
      return '정면 좌측 문';
    case 'C':
      if (seat.charAt(4) < '6') {
        return '정면 좌측 문';
      }
      return '정면 우측 문';
    case 'D':
    case 'E':
      return '정면 우측 문';
    case 'F':
    case 'G':
      return '좌측 문';
    case 'H':
      if (seat.charAt(4) < '5') {
        return '좌측 문';
      }
      return '우측 문';
    case 'I':
    case 'J':
      return '우측 문';
    default:
      return '';
  }
};

export default function Index() {
  const { sync: syncChapel, isSyncing } = useSyncChapel(2025, SemesterType.Two);
  const { data: general } = useGeneralChapelInformation(2025, SemesterType.Two);
  const { data: attendances } = useChapelAttendances(2025, SemesterType.Two);
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const pullDistance = useSharedValue(0);

  const totalAttendances = attendances?.length ?? 0;
  const requiredAttendances = Math.ceil(totalAttendances * (2 / 3));
  const attendedCount = attendances?.filter((a) => a.attendance === '출석').length ?? 0;
  const absentCount = attendances?.filter((a) => a.attendance === '결석').length ?? 0;
  const attendanceLeft = requiredAttendances - attendedCount;
  const passable = totalAttendances - absentCount >= requiredAttendances;

  const handleRefresh = () => {
    syncChapel();
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      if (event.contentOffset.y < 0 && !isSyncing) {
        pullDistance.value = Math.abs(event.contentOffset.y);
      } else if (event.contentOffset.y >= 0) {
        pullDistance.value = 0;
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -80 && !isSyncing) {
        scheduleOnRN(handleRefresh);
      }
      pullDistance.value = withSpring(0);
    },
  });

  // 일반 헤더 애니메이션
  const normalHeaderAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: isSyncing ? withTiming(0) : opacity,
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

  // ScrollView paddingTop 애니메이션
  const scrollViewAnimatedStyle = useAnimatedStyle(() => {
    if (isSyncing) {
      return {
        paddingTop: withSpring(insets.top + 24, { damping: 20, stiffness: 20 }),
      };
    }

    return {
      paddingTop: withTiming(0, { duration: 200 }),
    };
  });

  if (!general) {
    return (
      <SafeAreaView style={styles.topView}>
        <View style={styles.titleContainer}>
          <SsurfLined height={32} width={32} />
          <ThemedText typography="heading3xl">채플</ThemedText>
        </View>
        <Space gap={1} />
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText typography="bodyLg">
            정보를 가져오는 중이에요. 잠시만 기다려주세요.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={[styles.scrollView, scrollViewAnimatedStyle]}
      >
        <SafeAreaView edges={{ top: 'additive' }} style={styles.topView}>
          <View style={styles.titleContainer}>
            <SsurfLined height={32} width={32} />
            <ThemedText typography="heading3xl">채플</ThemedText>
          </View>
          <ThemedText typography="labelMd">
            {general.year}-{general.semester}학기
          </ThemedText>
          <Space gap={1} />
          <View>
            {attendanceLeft <= 0 ? (
              <ThemedText color="fgPrimary" typography="headingXl">
                축하해요! 이번 학기 PASS했어요!
              </ThemedText>
            ) : passable ? (
              <ThemedText typography="headingXl">
                {attendanceLeft}회 더 출석해야 PASS할 수 있어요
              </ThemedText>
            ) : (
              <ThemedText typography="headingXl">
                아쉽지만 이번 학기에는 PASS할 수 없어요
              </ThemedText>
            )}
            <ChapelProgress
              attendanceLeft={attendanceLeft}
              attendedArray={
                attendances
                  ?.filter((a) => a.attendance !== '')
                  .map((a) => a.attendance === '출석') || []
              }
              totalAttendances={totalAttendances}
            />
            <ThemedText style={{ alignSelf: 'flex-end' }}>
              {attendedCount}/{totalAttendances} 출석{' '}
              {absentCount > 0 ? `/ 결석 ${absentCount}회` : ''}
            </ThemedText>
            <ThemedText typography="bodyLg">{general.time}</ThemedText>
          </View>
        </SafeAreaView>
        <SafeAreaView edges={{ bottom: 'additive' }} style={styles.contentView}>
          <View style={styles.seatView}>
            <ThemedText typography="heading2xl">좌석 정보</ThemedText>
            <ThemedText typography="heading3xl">
              {general.floor}F / {general.seat}
            </ThemedText>
            {general.floor && general.seat && (
              <ThemedText typography="headingMd">
                {general.floor}층{' '}
                <ThemedText color="primaryInverted" typography="bodyLg">
                  {doorDirection(general.floor, general.seat)}
                </ThemedText>
                으로 들어가세요.
              </ThemedText>
            )}

            <ChapelSeatmapView
              floor={(general.floor ?? 1) as 1 | 2 | 3}
              seat={general.seat as `${string}-${number}-${number}`}
            />
          </View>
          <View style={styles.attendanceView}>
            {attendances &&
              attendances.map((attendance) => (
                <Attendance attendance={attendance} key={attendance.date} />
              ))}
          </View>
          <Space gap={8} />
        </SafeAreaView>
      </AnimatedScrollView>
      {/* 일반 헤더 */}
      <Animated.View style={[styles.header, normalHeaderAnimatedStyle]}>
        <LinearGradient
          colors={[theme.colors.surfaceDim, 'transparent']}
          end={{ x: 0.5, y: 1 }}
          start={{ x: 0.5, y: 0 }}
          style={styles.gradientHeader}
        >
          <SafeAreaView
            edges={{ top: 'additive' }}
            style={{
              width: '100%',
              height: 118,
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Animated.View style={textAnimatedStyle}>
              <ThemedText typography="headingXl">채플</ThemedText>
            </Animated.View>
            <Animated.View style={textAnimatedStyle}>
              <ThemedText typography="labelMd">
                {general.year}-{general.semester}학기
              </ThemedText>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* Refresh 헤더 */}
      <RefreshHeader isSyncing={isSyncing} pullDistance={pullDistance} />
    </View>
  );
}
