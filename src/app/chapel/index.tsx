import { SemesterType } from '@rusaint/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Attendance } from '@/components/chapel/Attendance';
import { ChapelProgress } from '@/components/chapel/ChapelProgress';
import { ChapelSeatmapView } from '@/components/chapel/ChapelSeatmapView';
import { Button } from '@/components/primitives/Button';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
import { useChapelAttendances, useGeneralChapelInformation } from '@/hooks/chapel/chapel';
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
    gap: theme.gap(2),
    flexDirection: 'column',
    padding: theme.gap(2),
  },
  titleContainer: { display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' },
  scrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.surfaceDim,
  },
  contentView: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
    backgroundColor: theme.colors.surface,
  },
  seatView: {
    paddingHorizontal: theme.gap(2),
    display: 'flex',
    gap: theme.gap(2),
    flexDirection: 'column',
  },
  attendanceView: {
    display: 'flex',
    flexDirection: 'column',
  },
  separator: {
    height: 0.5,
    width: '100%',
    backgroundColor: theme.colors.surfaceDimmer,
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

export default function Index() {
  const { logout } = useRusaintSession();
  const { data: general } = useGeneralChapelInformation(2025, SemesterType.Two);
  const { data: attendances } = useChapelAttendances(2025, SemesterType.Two);
  const { theme } = useUnistyles();

  const scrollY = useSharedValue(0);

  const totalAttendances = attendances?.length ?? 0;
  const requiredAttendances = Math.ceil(totalAttendances * (2 / 3));
  const attendedCount = attendances?.filter((a) => a.attendance === '출석').length ?? 0;
  const absentCount = attendances?.filter((a) => a.attendance === '결석').length ?? 0;
  const attendanceLeft = requiredAttendances - attendedCount;
  const passable = totalAttendances - absentCount >= requiredAttendances;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolate.CLAMP);
    return {
      opacity,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolate.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 100], [20, 0], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  if (!general) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        <SafeAreaView edges={{ top: 'additive' }} style={styles.topView}>
          <View style={styles.titleContainer}>
            <SsurfLined height={32} width={32} />
            <ThemedText style={{ fontWeight: '600' }} typography="heading2xl">
              채플 정보
            </ThemedText>
          </View>
          <ThemedText typography="labelMd">
            {general.year}-{general.semester}학기
          </ThemedText>
          <View>
            {attendanceLeft <= 0 ? (
              <ThemedText color="primary" typography="headingXl">
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
        <View style={styles.contentView}>
          <View style={styles.seatView}>
            <View style={{ marginTop: 10 }} />
            <ThemedText typography="heading2xl">좌석 정보</ThemedText>
            <ThemedText typography="headingXl">
              {general.floor}F / {general.seat}
            </ThemedText>
            <ChapelSeatmapView
              floor={(general.floor ?? 1) as 1 | 2 | 3}
              seat={general.seat as `${string}-${number}-${number}`}
            />
          </View>
          <View style={styles.attendanceView}>
            {attendances &&
              attendances.map((attendance) => (
                <Fragment key={attendance.date}>
                  <View style={styles.separator} />
                  <Attendance attendance={attendance} />
                </Fragment>
              ))}
          </View>
        </View>
      </AnimatedScrollView>
      <SafeAreaView edges={{ bottom: 'additive' }} style={styles.bottomView}>
        <Button onPress={logout} variant="primary">
          로그아웃
        </Button>
      </SafeAreaView>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
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
            }}
          >
            <Animated.View style={textAnimatedStyle}>
              <ThemedText style={{ fontWeight: 600 }} typography="headingXl">
                채플 정보
              </ThemedText>
            </Animated.View>
            <Animated.View style={textAnimatedStyle}>
              <ThemedText typography="labelMd">
                {general.year}-{general.semester}학기
              </ThemedText>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
