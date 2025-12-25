import { CourseType, YearSemester } from '@rusaint/react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import {
  useCheckRecentAttendedSemesters,
  useGradeSummary,
  useSemesterGrades,
} from '@/entities/grades/lib/queries';
import {
  useSyncClassGrades,
  useSyncGradeSummary,
  useSyncSemesterGrades,
} from '@/entities/grades/lib/sync';
import { SemesterGradeEntity } from '@/entities/grades/model';
import { GradeSequenceGraphWidget } from '@/features/grades/ui/sections/GradeSequenceGraphSection';
import { GradeSummaryWidget } from '@/features/grades/ui/sections/GradeSummarySection';
import { SemesterWidget } from '@/features/grades/ui/sections/SemesterSection';
import { SemestersWidget } from '@/features/grades/ui/sections/SemestersSection';
import { semesterToString } from '@/shared/lib/semester';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { AutoHeightFlatList } from '@/shared/ui/primitives/AutoHeightFlatList';
import { Space } from '@/shared/ui/primitives/Space';
import { Tabs } from '@/shared/ui/primitives/Tabs';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

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
  imageView: {
    width: 150,
    height: 150,
    marginBottom: theme.gap(2),
  },
}));

const SUMMARY_LABEL = '전체 학기';

type TabDataItem =
  | {
      data: SemesterGradeEntity | undefined;
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
  const { sync: syncClassGrades, isSyncing: isClassSyncing } = useSyncClassGrades();

  const { data: certiSummary } = useGradeSummary('certificated');
  const { data: recordedSummary } = useGradeSummary('recorded');
  const { data: semesters } = useSemesterGrades();
  const { attendedSemesters, isChecking } = useCheckRecentAttendedSemesters();

  const [selectedTab, setSelectedTab] = useState<null | YearSemester>(null);

  const scrollY = useSharedValue(0);

  const handleRefresh = async () => {
    await syncGradeSummary([CourseType.Bachelor], { force: true });
    await syncSemesterGrades([CourseType.Bachelor], { force: true });
    if (selectedTab) {
      await syncClassGrades([CourseType.Bachelor, selectedTab.year, selectedTab.semester], {
        force: true,
      });
    }
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
      data: SemesterGradeEntity | undefined;
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
    const newTab = key === SUMMARY_LABEL ? null : tabData.find((item) => item.key === key);
    if (newTab && newTab.type === 'semester') {
      setSelectedTab({ year: newTab.year, semester: newTab.semester });
    } else if (key === SUMMARY_LABEL) {
      setSelectedTab(null);
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
                <Image contentFit="contain" source={errorImage} style={styles.imageView} />
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
                <Image contentFit="contain" source={loadingImage} style={styles.imageView} />
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
    const newTab = tab === SUMMARY_LABEL ? null : tabData.find((item) => item.key === tab);
    if (newTab && newTab.type === 'semester') {
      setSelectedTab({ year: newTab.year, semester: newTab.semester });
    } else if (tab === SUMMARY_LABEL) {
      setSelectedTab(null);
    }
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
    selectedTab === null
      ? certiSummary
      : semesters.find((s) => s.year === selectedTab.year && s.semester === selectedTab.semester) ||
        certiSummary;

  // 선택된 semester 정보 추출
  const selectedSemesterData =
    selectedTab === null
      ? undefined
      : semesters.find((s) => s.year === selectedTab.year && s.semester === selectedTab.semester);

  // 현재 선택된 탭의 문자열 키
  const selectedTabKey = selectedTab === null ? SUMMARY_LABEL : semesterToString(selectedTab);

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
          refreshing={isSyncing || isSemesterSyncing || isClassSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="성적" />
              <ThemedText typography="labelMd">{selectedTabKey}</ThemedText>
              <Space gap={1} />
              <GradeSummaryWidget summary={displayedSummary} />
              <Space gap={1} />
              <GradeSequenceGraphWidget
                selectedSemester={selectedSemesterData?.semester}
                selectedYear={selectedSemesterData?.year}
                semesters={semesters}
              />
            </View>
            <Tabs.Root onValueChange={handleTabChange} value={selectedTabKey}>
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
              selectedKey={selectedTabKey}
            />
            <Space gap={8} />
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader label={selectedTabKey} scrollY={scrollY} title="성적" />
      </View>
    </>
  );
}
