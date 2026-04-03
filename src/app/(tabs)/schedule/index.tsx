import { SemesterType } from '@rusaint/react-native';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { useCalendars } from '@/entities/calendar/lib/queries';
import { useSyncCalendars } from '@/entities/calendar/lib/sync';
import { CalendarEntity } from '@/entities/calendar/model';
import { useCourseSchedule } from '@/entities/courseSchedule/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import { isTodayCalendar } from '@/features/calendar/lib/isTodayCalendar';
import { ScheduleGrid } from '@/features/schedule/ui/ScheduleGrid';
import { TodayScheduleSection } from '@/features/schedule/ui/TodayScheduleSection';
import {
  constructSemesters,
  getEstimatedCurrentSemester,
  semesterToString,
} from '@/shared/lib/semester';
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
  const { defaultScheduleSemester, studentId } = useRusaintApplication();
  const [selectedCalendarSlugs] = useSetting('selectedScheduleCalendarSlugs');
  const defaultSemester = defaultScheduleSemester ?? getEstimatedCurrentSemester(true);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);

  if (
    defaultScheduleSemester &&
    selectedSemester.year === getEstimatedCurrentSemester(true).year &&
    selectedSemester.semester === getEstimatedCurrentSemester(true).semester &&
    (defaultScheduleSemester.year !== selectedSemester.year ||
      defaultScheduleSemester.semester !== selectedSemester.semester)
  ) {
    setSelectedSemester(defaultScheduleSemester);
  }

  const { data, isSyncing, error, sync } = useCourseSchedule(
    selectedSemester.year,
    selectedSemester.semester,
  );
  const {
    data: calendars,
    error: calendarError,
    isSyncing: isCalendarSyncing,
  } = useCalendars(studentId ?? '', selectedCalendarSlugs);
  const { sync: syncCalendars } = useSyncCalendars(studentId ?? '');

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
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        console.error(`Cannot open feed URL: ${url}`);
        return;
      }

      await Linking.openURL(url);
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
    if (isSyncing || isCalendarSyncing) {
      return;
    }
    sync([selectedSemester.year, selectedSemester.semester], { force: true });
    void syncCalendars(selectedCalendarSlugs, { force: true });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const semesters = useMemo(
    () =>
      constructSemesters(defaultSemester.year - 4, defaultSemester.year, [
        SemesterType.Two,
        SemesterType.One,
      ]),
    [defaultSemester.year],
  );

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
          headerTitle: () => <></>,
          headerTransparent: true,
          title: '시간표',
        }}
      />
      <View style={styles.root}>
        <RefreshableScrollView
          onRefresh={handleRefresh}
          onScroll={scrollHandler}
          refreshing={isSyncing || isCalendarSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="시간표" />
              <ThemedText typography="labelMd">{semesterToString(selectedSemester)}</ThemedText>
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
                  <ScheduleGrid data={data} />
                </View>
                <Space gap={8} />
              </>
            ) : (
              renderEmptyContent()
            )}
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader
          label={semesterToString(selectedSemester)}
          scrollY={scrollY}
          title="시간표"
        />
      </View>
    </>
  );
}
