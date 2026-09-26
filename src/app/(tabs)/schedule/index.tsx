import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import {
  useCourseInformationCandidates,
  useCourseSchedule,
} from '@/entities/courseSchedule/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import { useEnrollmentSemesters } from '@/entities/studentInformation/lib/queries';
import { buildScheduleSemesters } from '@/features/schedule/lib/utils';
import { ScheduleGrid } from '@/features/schedule/ui/ScheduleGrid';
import { getEstimatedCurrentSemester, semesterToSlug } from '@/shared/lib/semester';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { SearchIcon } from '@/shared/ui/icons';
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
  searchButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  searchButtonPressed: {
    opacity: 0.55,
  },
  stateImage: {
    height: 150,
    marginBottom: 16,
    width: 150,
  },
  paddedSection: {
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
  const { theme } = useUnistyles();
  const { defaultScheduleSemester } = useRusaintApplication();
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
  const {
    data: courseInformation,
    isSyncing: isCourseInformationSyncing,
    refresh: refreshCourseInformation,
  } = useCourseInformationCandidates(
    effectiveSelectedSemester.year,
    effectiveSelectedSemester.semester,
  );

  const scrollY = useSharedValue(0);

  const handleRefresh = () => {
    if (isSyncing || isCourseInformationSyncing || isEnrollmentSyncing) {
      return;
    }
    void refreshSchedule();
    void refreshCourseInformation();
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
              <Pressable
                accessibilityLabel="강의 검색"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/schedule/search',
                    params: { term: semesterToSlug(effectiveSelectedSemester) },
                  })
                }
                style={({ pressed }) => [
                  styles.searchButton,
                  pressed && styles.searchButtonPressed,
                ]}
              >
                <SearchIcon color={theme.colorsHex.fgPrimary} size={22} />
              </Pressable>
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
          refreshing={isSyncing || isEnrollmentSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.paddedSection}>
              <Header title="시간표" />
            </View>
            {hasData ? (
              <View style={styles.gridContainer}>
                <ScheduleGrid
                  courseInformation={courseInformation}
                  data={data}
                  semester={effectiveSelectedSemester.semester}
                  year={effectiveSelectedSemester.year}
                />
              </View>
            ) : (
              renderEmptyContent()
            )}
            <Space gap={8} />
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader scrollY={scrollY} title="시간표" />
      </View>
    </>
  );
}
