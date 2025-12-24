import { SemesterType } from '@rusaint/react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { useSyncChapel } from '@/entities/chapel/lib/sync/useSyncChapel';
import { useChapelAttendances } from '@/entities/chapel/lib/useChapelAttendances';
import { useGeneralChapelInformation } from '@/entities/chapel/lib/useGeneralChapelInformation';
import { Attendance } from '@/features/chapel/ui/Attendance';
import { ChapelProgress } from '@/features/chapel/ui/ChapelProgress';
import { ChapelSeatmapView } from '@/features/chapel/ui/ChapelSeatmapView';
import {
  constructSemesters,
  getEstimatedCurrentSemester,
  semesterToString,
} from '@/shared/lib/semester';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { CardView } from '@/shared/ui/containers/CardView';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { SemesterSelector } from '@/shared/ui/SemesterSelector';

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },

  topView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'column',
    padding: theme.gap(3),
  },
  errorView: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 16,
    marginBottom: 96,
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

const RUSAINT_NO_CHAPEL =
  'RusaintError.General: Error from application: No chapel information provided';

export default function Index() {
  const { defaultChapelSemester } = useRusaintApplication();
  const defaultSemester = defaultChapelSemester ?? getEstimatedCurrentSemester();
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);

  const { sync: syncChapel, isSyncing, error } = useSyncChapel();
  const { data: general } = useGeneralChapelInformation(
    selectedSemester.year,
    selectedSemester.semester,
  );
  const { data: attendances } = useChapelAttendances(
    selectedSemester.year,
    selectedSemester.semester,
  );

  const scrollY = useSharedValue(0);

  const totalAttendances = attendances?.length ?? 0;
  const requiredAttendances = Math.ceil(totalAttendances * (2 / 3));
  const attendedCount = attendances?.filter((a) => a.attendance === '출석').length ?? 0;
  const absentCount = attendances?.filter((a) => a.attendance === '결석').length ?? 0;
  const attendanceLeft = requiredAttendances - attendedCount;
  const passable = totalAttendances - absentCount >= requiredAttendances;

  const handleRefresh = () => {
    syncChapel([selectedSemester.year, selectedSemester.semester], { force: true });
  };

  useEffect(() => {
    if (selectedSemester) {
      syncChapel([selectedSemester.year, selectedSemester.semester]);
    }
  }, [selectedSemester, syncChapel]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (!general) {
    return (
      <View style={styles.root}>
        <SafeContainer>
          {Platform.OS === 'ios' && <Space gap={2} />}
          <View style={styles.topView}>
            <Header title="채플" />
            <ThemedText typography="labelMd">{semesterToString(selectedSemester)}</ThemedText>
          </View>
          <Space gap={1} />
          <View style={styles.errorView}>
            {error ? (
              error.message === RUSAINT_NO_CHAPEL ? (
                <>
                  <Image
                    contentFit="contain"
                    source={emptyImage}
                    style={{ width: 150, height: 150, marginBottom: 16 }}
                  />
                  <ThemedText typography="headingLg">선택한 학기의 채플 정보가 없어요.</ThemedText>
                  <ThemedText typography="bodyLg">다른 학기를 선택해주세요.</ThemedText>
                </>
              ) : (
                <>
                  <Image
                    contentFit="contain"
                    source={errorImage}
                    style={{ width: 150, height: 150, marginBottom: 16 }}
                  />
                  <ThemedText color="error" typography="headingLg">
                    정보를 가져오는 중 오류가 발생했어요.
                  </ThemedText>
                  <ThemedText typography="bodyLg">아래로 당겨 다시 시도해보세요.</ThemedText>
                  <ThemedText typography="bodySm">{error.message}</ThemedText>
                </>
              )
            ) : (
              <>
                <Image
                  contentFit="contain"
                  source={loadingImage}
                  style={{ width: 150, height: 150, marginBottom: 16 }}
                />
                <ThemedText typography="headingLg">정보를 가져오는 중이에요.</ThemedText>
                <ThemedText typography="bodyLg">잠시만 기다려주세요.</ThemedText>
              </>
            )}
          </View>
        </SafeContainer>
      </View>
    );
  }

  const semesters = constructSemesters(defaultSemester.year - 4, defaultSemester.year, [
    SemesterType.Two,
    SemesterType.One,
  ]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '채플',
          headerTitle: () => <></>,
          headerRight: () => (
            <SemesterSelector
              onChange={(index) => setSelectedSemester(semesters[index])}
              selectedIndex={semesters.findIndex(
                (semester) =>
                  semester.year === selectedSemester.year &&
                  semester.semester === selectedSemester.semester,
              )}
              semesters={semesters}
            />
          ),
        }}
      />
      <View style={styles.root}>
        <RefreshableScrollView
          onRefresh={handleRefresh}
          onScroll={scrollHandler}
          refreshing={isSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="채플" />
              <ThemedText typography="labelMd">{semesterToString(selectedSemester)}</ThemedText>
              <Space gap={1} />
              <View>
                {attendanceLeft <= 0 ? (
                  <ThemedText color="fgPrimary" typography="headingXl">
                    축하해요! 이번 학기 PASS했어요!
                  </ThemedText>
                ) : passable ? (
                  <ThemedText typography="headingXl">
                    <ThemedText color="successInverted" typography="headingXl">
                      {attendanceLeft}회
                    </ThemedText>{' '}
                    더 출석해야 PASS할 수 있어요
                  </ThemedText>
                ) : (
                  <ThemedText typography="headingXl">
                    아쉽지만 이번 학기에는 PASS할 수 없어요
                  </ThemedText>
                )}
                <Space gap={1} />
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
            </View>
            <CardView>
              <ThemedText typography="headingLg">좌석 정보</ThemedText>
              <ThemedText typography="heading3xl">
                {general.floor}F / {general.seat}
              </ThemedText>
              {general.floor && general.seat && doorDirection(general.floor, general.seat) && (
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
            </CardView>
            <CardView>
              <ThemedText typography="headingLg">출석 정보</ThemedText>
              <Space gap={0} />
              {attendances &&
                attendances.map((attendance) => (
                  <Attendance attendance={attendance} key={attendance.date} />
                ))}
            </CardView>
            <Space gap={8} />
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader label={semesterToString(selectedSemester)} scrollY={scrollY} title="채플" />
      </View>
    </>
  );
}
