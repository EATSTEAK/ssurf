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
import { useCourseSchedule } from '@/entities/courseSchedule/lib/queries';
import { useSyncCourseSchedule } from '@/entities/courseSchedule/lib/sync';
import { ScheduleGrid } from '@/features/schedule/ui/ScheduleGrid';
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
  gridContainer: {
    paddingHorizontal: theme.gap(1),
  },
}));

const RUSAINT_NO_SCHEDULE =
  'RusaintError.General: Error from application: No schedule information provided';

export default function Index() {
  const { defaultScheduleSemester } = useRusaintApplication();
  const defaultSemester = defaultScheduleSemester ?? getEstimatedCurrentSemester(true);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);

  const { sync: syncSchedule, isSyncing, error } = useSyncCourseSchedule();
  const { data } = useCourseSchedule(selectedSemester.year, selectedSemester.semester);

  const scrollY = useSharedValue(0);

  const handleRefresh = () => {
    if (isSyncing) {
      return;
    }
    syncSchedule([selectedSemester.year, selectedSemester.semester], { force: true });
  };

  useEffect(() => {
    if (selectedSemester) {
      syncSchedule([selectedSemester.year, selectedSemester.semester]);
    }
  }, [selectedSemester, syncSchedule]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const semesters = constructSemesters(defaultSemester.year - 4, defaultSemester.year, [
    SemesterType.Two,
    SemesterType.One,
  ]);

  const hasData = data.length > 0;

  const renderEmptyContent = () => (
    <>
      <Space gap={1} />
      <View style={styles.errorView}>
        {error ? (
          error.message === RUSAINT_NO_SCHEDULE ? (
            <>
              <Image
                contentFit="contain"
                source={emptyImage}
                style={{ width: 150, height: 150, marginBottom: 16 }}
              />
              <ThemedText typography="headingLg">선택한 학기의 시간표가 없어요.</ThemedText>
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
    </>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '시간표',
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
          onScroll={hasData ? scrollHandler : undefined}
          refreshing={isSyncing}
          scrollEventThrottle={hasData ? 16 : undefined}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="시간표" />
              <ThemedText typography="labelMd">{semesterToString(selectedSemester)}</ThemedText>
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
        {hasData && (
          <FloatingHeader
            label={semesterToString(selectedSemester)}
            scrollY={scrollY}
            title="시간표"
          />
        )}
      </View>
    </>
  );
}
