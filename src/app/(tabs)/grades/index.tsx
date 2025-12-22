import { CourseType } from '@rusaint/react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useState } from 'react';
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
import { useGradeSummary, useSemesterGrades } from '@/hooks/grades/grades';
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

  const tabs =
    certiSummary && semesters
      ? [
          SUMMARY_LABEL,
          ...semesters.map((s) => semesterToString({ year: s.year, semester: s.semester })),
        ]
      : [];

  type TabDataItem =
    | {
        key: string;
        semester: NonNullable<typeof semesters>[number];
        type: 'semester';
      }
    | { key: string; semester?: never; type: 'summary' };

  const tabData: TabDataItem[] =
    certiSummary && semesters
      ? [
          { key: SUMMARY_LABEL, type: 'summary' },
          ...semesters.map((s) => ({
            key: semesterToString({ year: s.year, semester: s.semester }),
            semester: s,
            type: 'semester' as const,
          })),
        ]
      : [];

  // 페이지 변경 시 탭 업데이트
  const handlePageChange = (key: string) => {
    if (key !== selectedTab) {
      setSelectedTab(key);
    }
  };

  if (!certiSummary || !recordedSummary || !semesters) {
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
    return item.type === 'summary' ? (
      <SemestersWidget
        certiSummary={certiSummary}
        recordedSummary={recordedSummary}
        semesters={semesters}
      />
    ) : (
      <SemesterWidget semester={item.semester} />
    );
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
