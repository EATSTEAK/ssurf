import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { useCalendars } from '@/entities/calendar/lib/queries';
import { CalendarEntity } from '@/entities/calendar/model';
import { useCourseInformationSync, useCourseSchedule } from '@/entities/courseSchedule/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import { useEnrollmentSemesters } from '@/entities/studentInformation/lib/queries';
import { isTodayCalendar } from '@/features/calendar/lib/isTodayCalendar';
import { buildScheduleSemesters } from '@/features/schedule/lib/utils';
import { ScheduleGrid } from '@/features/schedule/ui/ScheduleGrid';
import { TodayScheduleSection } from '@/features/schedule/ui/TodayScheduleSection';
import { getEstimatedCurrentSemester, semesterToString } from '@/shared/lib/semester';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { SemesterSelector } from '@/shared/ui/SemesterSelector';

const styles = StyleSheet.create((theme) => ({
  errorView: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    marginBottom: 96,
  },
  gridContainer: {
    paddingHorizontal: theme.gap(1),
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(1),
  },
  root: {
    backgroundColor: theme.colors.surface,
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  stateImage: {
    height: 150,
    marginBottom: 16,
    width: 150,
  },
  topView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
    padding: theme.gap(3),
    width: '100%',
  },
}));

const RUSAINT_NO_SCHEDULE =
  'RusaintError.General: Error from application: No schedule information provided';

export default function Index() {
  const router = useRouter();
  const { defaultScheduleSemester } = useRusaintApplication();
  const [selectedCalendarSlugs] = useSetting('schedule.selectedCalendarSlugs');
  const [savedSemester, setSavedSemester] = useSetting('schedule.selectedSemester');
  const {
    data: enrollmentSemesters,
    isSyncing: isEnrollmentSyncing,
    refresh: refreshEnrollmentSemesters,
  } = useEnrollmentSemesters();
  const estimatedCurrentSemester = getEstimatedCurrentSemester();
  const effectiveSelectedSemester =
    savedSemester ?? defaultScheduleSemester ?? estimatedCurrentSemester;
  const semesters = buildScheduleSemesters(
    estimatedCurrentSemester,
    enrollmentSemesters,
    defaultScheduleSemester,
    savedSemester,
  );

  const {
    data,
    isSyncing,
    error,
    refresh: refreshSchedule,
  } = useCourseSchedule(effectiveSelectedSemester.year, effectiveSelectedSemester.semester);
  const { isSyncing: isCourseInformationSyncing, refresh: refreshCourseInformation } =
    useCourseInformationSync(effectiveSelectedSemester.year, effectiveSelectedSemester.semester);
  const {
    data: calendars,
    error: calendarError,
    isSyncing: isCalendarSyncing,
    refresh: refreshCalendars,
  } = useCalendars(selectedCalendarSlugs);

  const todayCalendars = useMemo(() => {
    const now = new Date();
    return calendars.filter((item) => isTodayCalendar(item, now));
  }, [calendars]);

  const scrollY = useSharedValue(0);

  const handleOpenUrl = useCallback(async (url: null | string) => {
    if (!url) {
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (openError) {
      console.error('Failed to open feed URL:', openError);
    }
  }, []);

  const handlePressCalendar = useCallback(
    (item: CalendarEntity) => {
      void handleOpenUrl(item.url);
    },
    [handleOpenUrl],
  );

  const handleRefresh = () => {
    if (isSyncing || isCourseInformationSyncing || isCalendarSyncing || isEnrollmentSyncing) {
      return;
    }
    void refreshSchedule();
    void refreshCourseInformation();
    void refreshCalendars();
    void refreshEnrollmentSemesters();
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const hasData = data.length > 0;

  const renderEmptyContent = () => (
    <>
      <Space gap={1} />
      <View style={styles.errorView}>
        {error ? (
          error.message === RUSAINT_NO_SCHEDULE ? (
            <>
              <Image contentFit="contain" source={emptyImage} style={styles.stateImage} />
              <ThemedText typography="headingLg">선택한 학기의 시간표가 없어요.</ThemedText>
              <ThemedText typography="bodyLg">다른 학기를 선택해주세요.</ThemedText>
            </>
          ) : (
            <>
              <Image contentFit="contain" source={errorImage} style={styles.stateImage} />
              <ThemedText color="error" typography="headingLg">
                정보를 가져오는 중 오류가 발생했어요.
              </ThemedText>
              <ThemedText typography="bodyLg">아래로 당겨 다시 시도해보세요.</ThemedText>
              <ThemedText typography="bodySm">{error.message}</ThemedText>
            </>
          )
        ) : (
          <>
            <Image contentFit="contain" source={loadingImage} style={styles.stateImage} />
            <ThemedText typography="headingLg">정보를 가져오는 중이에요.</ThemedText>
            <ThemedText typography="bodyLg">잠시만 기다려주세요.</ThemedText>
          </>
        )}
      </View>
    </>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerRight: () => (
            <View style={styles.headerActions}>
              {isCourseInformationSyncing ? (
                <ActivityIndicator accessibilityLabel="과목 정보 불러오는 중" size="small" />
              ) : null}
              <SemesterSelector
                onChange={(_, semester) => void setSavedSemester(semester)}
                selectedIndex={semesters.findIndex(
                  (semester) =>
                    semester.year === effectiveSelectedSemester.year &&
                    semester.semester === effectiveSelectedSemester.semester,
                )}
                semesters={semesters}
              />
            </View>
          ),
          headerTitle: () => <></>,
          headerTransparent: true,
          title: '시간표',
        }}
      />
      <View style={styles.root}>
        <RefreshableScrollView
          onRefresh={handleRefresh}
          onScroll={scrollHandler}
          refreshing={isSyncing || isCalendarSyncing || isEnrollmentSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="시간표" />
              <ThemedText typography="labelMd">
                {semesterToString(effectiveSelectedSemester)}
              </ThemedText>
              <TodayScheduleSection
                actionLabel="월간 일정 보기"
                calendarError={calendarError ?? null}
                onPressAction={() => router.push('/(tabs)/schedule/calendar')}
                onPressCalendar={handlePressCalendar}
                selectedCalendarSlugs={selectedCalendarSlugs}
                todayCalendars={todayCalendars}
              />
            </View>
            {hasData ? (
              <>
                <View style={styles.gridContainer}>
                  <ScheduleGrid
                    data={data}
                    semester={effectiveSelectedSemester.semester}
                    year={effectiveSelectedSemester.year}
                  />
                </View>
                <Space gap={8} />
              </>
            ) : (
              renderEmptyContent()
            )}
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader
          label={semesterToString(effectiveSelectedSemester)}
          scrollY={scrollY}
          title="시간표"
        />
      </View>
    </>
  );
}
