import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { calculateRequiredAttendances } from '@/entities/chapel/lib/attendanceCriteria';
import { useChapelAttendances, useGeneralChapelInformation } from '@/entities/chapel/lib/queries';
import { getChapelDoorDirection } from '@/entities/chapel/lib/seat';
import { useEnrollmentSemesters } from '@/entities/studentInformation/lib/queries';
import { Attendance } from '@/features/chapel/ui/Attendance';
import { ChapelProgress } from '@/features/chapel/ui/ChapelProgress';
import { ChapelSeatmapView } from '@/features/chapel/ui/ChapelSeatmapView';
import { getEstimatedCurrentSemester } from '@/shared/lib/semester';
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

const RUSAINT_NO_CHAPEL =
  'RusaintError.General: Error from application: No chapel information provided';

export default function Index() {
  const { defaultChapelSemester } = useRusaintApplication();
  const {
    data: enrollmentSemesters,
    isSyncing: isEnrollmentSyncing,
    refresh: refreshEnrollmentSemesters,
  } = useEnrollmentSemesters();
  const defaultSemester = defaultChapelSemester ?? getEstimatedCurrentSemester(true);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);
  const semesters = enrollmentSemesters.length > 0 ? enrollmentSemesters : [defaultSemester];
  const effectiveSelectedSemester =
    semesters.find(
      (semester) =>
        semester.year === selectedSemester.year && semester.semester === selectedSemester.semester,
    ) ??
    semesters[0] ??
    defaultSemester;

  const {
    data: general,
    error,
    isSyncing,
    refresh,
  } = useGeneralChapelInformation(
    effectiveSelectedSemester.year,
    effectiveSelectedSemester.semester,
  );
  const { data: attendances } = useChapelAttendances(
    effectiveSelectedSemester.year,
    effectiveSelectedSemester.semester,
  );

  const scrollY = useSharedValue(0);

  const totalAttendances = attendances?.length ?? 0;
  const requiredAttendances = calculateRequiredAttendances(
    totalAttendances,
    effectiveSelectedSemester.year,
    effectiveSelectedSemester.semester,
  );
  const attendedCount = attendances?.filter((a) => a.attendance === '출석').length ?? 0;
  const absentCount = attendances?.filter((a) => a.attendance === '결석').length ?? 0;
  const attendanceLeft = requiredAttendances - attendedCount;
  const hasMetAttendanceRequirement = attendanceLeft <= 0;
  const canStillMeetAttendanceRequirement = totalAttendances - absentCount >= requiredAttendances;
  const finalResult = general?.result?.trim() ?? '';
  const entrance = getChapelDoorDirection(general?.seat);

  const handleRefresh = () => {
    // 로딩 중이면 리프레시하지 않음
    if (isSyncing || isEnrollmentSyncing) {
      return;
    }
    void refresh();
    void refreshEnrollmentSemesters();
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (!general) {
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
                onChange={(_, semester) => setSelectedSemester(semester)}
                selectedIndex={semesters.findIndex(
                  (semester) =>
                    semester.year === effectiveSelectedSemester.year &&
                    semester.semester === effectiveSelectedSemester.semester,
                )}
                semesters={semesters}
              />
            ),
          }}
        />
        <View style={styles.root}>
          <RefreshableScrollView
            onRefresh={handleRefresh}
            refreshing={isSyncing || isEnrollmentSyncing}
          >
            <SafeContainer>
              {Platform.OS === 'ios' && <Space gap={2} />}
              <View style={styles.topView}>
                <Header title="채플" />
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
                      <ThemedText typography="headingLg">
                        선택한 학기의 채플 정보가 없어요.
                      </ThemedText>
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
          </RefreshableScrollView>
        </View>
      </>
    );
  }

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
              onChange={(_, semester) => setSelectedSemester(semester)}
              selectedIndex={semesters.findIndex(
                (semester) =>
                  semester.year === effectiveSelectedSemester.year &&
                  semester.semester === effectiveSelectedSemester.semester,
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
          refreshing={isSyncing || isEnrollmentSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="채플" />
              <Space gap={1} />
              <View>
                {finalResult ? (
                  <ThemedText color="fgPrimary" typography="headingXl">
                    {finalResult}
                  </ThemedText>
                ) : hasMetAttendanceRequirement ? (
                  <ThemedText color="fgPrimary" typography="headingXl">
                    축하해요! 이번 학기 PASS했어요!
                  </ThemedText>
                ) : canStillMeetAttendanceRequirement ? (
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
              {general.floor && general.seat && entrance && (
                <ThemedText typography="headingMd">
                  {general.floor}층{' '}
                  <ThemedText color="primaryInverted" typography="bodyLg">
                    {entrance}
                  </ThemedText>
                  으로 들어가세요.
                </ThemedText>
              )}

              <ChapelSeatmapView floor={(general.floor ?? 1) as 1 | 2 | 3} seat={general.seat} />
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
        <FloatingHeader scrollY={scrollY} title="채플" />
      </View>
    </>
  );
}
