import { CourseType } from '@rusaint/react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { SafeContainer } from '@/components/containers/Container';
import { RefreshableScrollView } from '@/components/containers/RefreshableScrollView';
import { GradeSequenceGraphWidget } from '@/components/grades/widgets/GradeSequenceGraphWidget';
import { GradeSummaryWidget } from '@/components/grades/widgets/GradeSummaryWidget';
import { SemestersWidget } from '@/components/grades/widgets/SemestersWidget';
import { SemesterWidget } from '@/components/grades/widgets/SemesterWidget';
import { FloatingHeader } from '@/components/headers/FloatingHeader';
import { Header } from '@/components/headers/Header';
import { AutoHeightFlatList } from '@/components/primitives/AutoHeightFlatList';
import { Space } from '@/components/primitives/Space';
import { Tabs } from '@/components/primitives/Tabs';
import { ThemedText } from '@/components/primitives/ThemedText';
import { SemesterGradeDto } from '@/db/schema/grades';
import {
  useCheckRecentAttendedSemesters,
  useGradeSummary,
  useSemesterGrades,
} from '@/hooks/grades/grades';
import { useSyncGradeSummary, useSyncSemesterGrades } from '@/hooks/sync/useSyncGrades';
import { semesterToString } from '@/utils/semester';

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

const SUMMARY_LABEL = '전체 학기';

type TabDataItem =
  | {
      data: SemesterGradeDto | undefined;
      key: string;
      semester: number;
      type: 'semester';
      year: number;
    }
  | { data?: never; key: string; semester?: never; type: 'summary'; year?: never };

export default function Index() {
  const { sync: syncGradeSummary, isSyncing, error } = useSyncGradeSummary();
  const {
    sync: syncSemesterGrades,
    isSyncing: isSemesterSyncing,
    error: semesterError,
  } = useSyncSemesterGrades();
  const { data: certiSummary } = useGradeSummary('certificated');
  const { data: recordedSummary } = useGradeSummary('recorded');
  const { data: semesters } = useSemesterGrades();
  const { attendedSemesters, isChecking } = useCheckRecentAttendedSemesters();

  const [selectedTab, setSelectedTab] = useState<string>(SUMMARY_LABEL);

  const scrollY = useSharedValue(0);

  const handleRefresh = () => {
    syncGradeSummary([CourseType.Bachelor], { force: true });
    syncSemesterGrades([CourseType.Bachelor], { force: true });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const allSemesterItems = useMemo(() => {
    if (!semesters) {
      return [];
    }

    const items: Array<{
      data: SemesterGradeDto | undefined;
      key: string;
      semester: number;
      type: 'semester';
      year: number;
    }> = [];

    // 과목이 있는 최근 학기를 먼저 추가 (데이터가 있으면 포함)
    attendedSemesters.forEach((attended) => {
      const semesterData = semesters.find(
        (s) => s.year === attended.year && s.semester === attended.semester,
      );
      items.push({
        data: semesterData,
        key: semesterToString(attended),
        semester: attended.semester,
        type: 'semester' as const,
        year: attended.year,
      });
    });

    // 기존 학기들 중 과목이 있는 최근 학기에 포함되지 않은 것만 추가
    semesters.forEach((s) => {
      const isAttended = attendedSemesters.some(
        (attended) => attended.year === s.year && attended.semester === s.semester,
      );
      if (!isAttended) {
        items.push({
          data: s,
          key: semesterToString({ semester: s.semester, year: s.year }),
          semester: s.semester,
          type: 'semester' as const,
          year: s.year,
        });
      }
    });

    return items;
  }, [semesters, attendedSemesters]);

  const tabs =
    certiSummary && allSemesterItems
      ? [SUMMARY_LABEL, ...allSemesterItems.map((item) => item.key)]
      : [];

  const tabData: TabDataItem[] =
    certiSummary && allSemesterItems
      ? [{ key: SUMMARY_LABEL, type: 'summary' }, ...allSemesterItems]
      : [];

  // 페이지 변경 시 탭 업데이트
  const handlePageChange = (key: string) => {
    if (key !== selectedTab) {
      setSelectedTab(key);
    }
  };

  if (!certiSummary || !recordedSummary || !semesters || isChecking) {
    return (
      <View style={styles.root}>
        <SafeContainer>
          {Platform.OS === 'ios' && <Space gap={2} />}
          <View style={styles.topView}>
            <Header title="성적" />
          </View>
          <Space gap={1} />
          <View style={styles.errorView}>
            {error || semesterError ? (
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
                <ThemedText typography="bodySm">
                  {error?.message || semesterError?.message}
                </ThemedText>
              </>
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

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  const renderItem = (item: TabDataItem) => {
    if (item.type === 'summary') {
      return (
        <SemestersWidget
          certiSummary={certiSummary}
          recordedSummary={recordedSummary}
          semesters={semesters}
        />
      );
    }

    return <SemesterWidget data={item.data} semester={item.semester} year={item.year} />;
  };

  // 선택된 탭에 따라 표시할 성적 데이터 결정
  const displayedSummary =
    selectedTab === SUMMARY_LABEL
      ? certiSummary
      : semesters.find(
          (s) => semesterToString({ year: s.year, semester: s.semester }) === selectedTab,
        ) || certiSummary;

  // 선택된 semester 정보 추출
  const selectedSemesterData = semesters.find(
    (s) => semesterToString({ year: s.year, semester: s.semester }) === selectedTab,
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '성적',
          headerTitle: () => <></>,
        }}
      />
      <View style={styles.root}>
        <RefreshableScrollView
          onRefresh={handleRefresh}
          onScroll={scrollHandler}
          refreshing={isSyncing || isSemesterSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="성적" />
              <ThemedText typography="labelMd">{selectedTab}</ThemedText>
              <Space gap={1} />
              <GradeSummaryWidget summary={displayedSummary} />
              <Space gap={1} />
              <GradeSequenceGraphWidget
                selectedSemester={selectedSemesterData?.semester}
                selectedYear={selectedSemesterData?.year}
                semesters={semesters}
              />
            </View>
            <Tabs.Root onValueChange={handleTabChange} value={selectedTab}>
              <Tabs.List>
                {tabs.map((tab) => (
                  <Tabs.Trigger key={tab} value={tab} />
                ))}
              </Tabs.List>
            </Tabs.Root>
            <AutoHeightFlatList
              data={tabData}
              keyExtractor={(item) => item.key}
              onPageChange={handlePageChange}
              renderItem={renderItem}
              selectedKey={selectedTab}
            />
            <Space gap={8} />
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader label={selectedTab} scrollY={scrollY} title="성적" />
      </View>
    </>
  );
}
