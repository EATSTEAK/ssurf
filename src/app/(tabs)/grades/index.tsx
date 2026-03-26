import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { TabView } from 'react-native-tab-view';
import { StyleSheet } from 'react-native-unistyles';

import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { useGradeTabView } from '@/features/grades/lib/useGradeTabView';
import { useGraduationView } from '@/features/grades/lib/useGraduationView';
import { GradeOverviewTabView, GradeTabView, SemesterGradeTabView } from '@/features/grades/model';
import { BlurGradeProvider, useBlurGrade } from '@/features/grades/providers/BlurGradeProvider';
import { GradeSequenceGraphSection } from '@/features/grades/ui/sections/GradeSequenceGraphSection';
import { GradeSummarySection } from '@/features/grades/ui/sections/GradeSummarySection';
import { SemesterSection } from '@/features/grades/ui/sections/SemesterSection';
import { SemestersSection } from '@/features/grades/ui/sections/SemestersSection';
import { semesterToString } from '@/shared/lib/semester';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { EyeIcon, EyeOffIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';
import { TabsRoute, TabsTabBar, useAutoHeightTabView } from '@/shared/ui/primitives/Tabs';
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
    paddingVertical: theme.gap(3),
  },
  topInnerView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'column',
    paddingHorizontal: theme.gap(3),
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
  eyeIcon: {
    size: 16,
    color: theme.colorsHex.fgSurface,
  },
  eyeOffIcon: {
    size: 16,
    color: theme.colorsHex.fgSurfaceMuted,
  },
}));

const SUMMARY_LABEL = '전체 학기';

function getTabKey(item: GradeTabView): string {
  if (item.type === 'overview') {
    return SUMMARY_LABEL;
  }
  return semesterToString({ semester: item.semester, year: item.year });
}

function GradesContent() {
  const { width } = useWindowDimensions();
  const { data, error, isLoading, refresh } = useGradeTabView();
  const {
    data: graduation,
    error: graduationError,
    isLoading: isGraduationLoading,
    refresh: graduationRefresh,
  } = useGraduationView();
  const [selectedTabKey, setSelectedTabKey] = useState<string>(SUMMARY_LABEL);
  const { isBlurred, toggleBlur } = useBlurGrade();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const gradeData = useMemo(() => data ?? [], [data]);
  const tabs = useMemo(() => gradeData.map(getTabKey), [gradeData]);
  const tabMap = useMemo(
    () => Object.fromEntries(gradeData.map((item) => [getTabKey(item), item])),
    [gradeData],
  );
  const overview = useMemo(
    () => gradeData.find((item): item is GradeOverviewTabView => item.type === 'overview'),
    [gradeData],
  );
  const semesters = useMemo(
    () =>
      gradeData
        .filter((item): item is SemesterGradeTabView => item.type === 'semester')
        .map((item) => item.data)
        .filter((s) => s !== undefined),
    [gradeData],
  );
  const selectedTab = tabMap[selectedTabKey];
  const selectedSemesterData = selectedTab?.type === 'semester' ? selectedTab.data : undefined;
  const displayedSummary = selectedSemesterData ?? overview?.certificated ?? {
    attemptedCredits: 0,
    earnedCredits: 0,
    gradePointsAverage: 0,
  };
  const routes = useMemo<TabsRoute[]>(() => tabs.map((tab) => ({ key: tab, title: tab })), [tabs]);
  const currentIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === selectedTabKey),
  );
  const navigationState = useMemo(
    () => ({ index: currentIndex, routes }),
    [currentIndex, routes],
  );
  const { handleSceneLayout, handleTabBarLayout, tabViewHeight } = useAutoHeightTabView(navigationState);

  const handleErrorRefresh = async () => {
    if (isLoading || isGraduationLoading) {
      return;
    }
    await refresh(null);
    await graduationRefresh();
  };

  if (!data || !graduation || !overview) {
    return (
      <View style={styles.root}>
        <RefreshableScrollView
          onRefresh={handleErrorRefresh}
          refreshing={isLoading || isGraduationLoading}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topInnerView}>
              <Pressable onPress={toggleBlur}>
                <Header title="성적" />
              </Pressable>
            </View>
            <Space gap={1} />
            <View style={styles.errorView}>
              {error ? (
                <>
                  <Image contentFit="contain" source={errorImage} style={styles.imageView} />
                  <ThemedText color="error" typography="headingLg">
                    정보를 가져오는 중 오류가 발생했어요.
                  </ThemedText>
                  <ThemedText typography="bodyLg">아래로 당겨 다시 시도해보세요.</ThemedText>
                  <ThemedText typography="bodySm">{error?.message}</ThemedText>
                </>
              ) : graduationError ? (
                <>
                  <Image contentFit="contain" source={errorImage} style={styles.imageView} />
                  <ThemedText color="error" typography="headingLg">
                    정보를 가져오는 중 오류가 발생했어요.
                  </ThemedText>
                  <ThemedText typography="bodyLg">아래로 당겨 다시 시도해보세요.</ThemedText>
                  <ThemedText typography="bodySm">{graduationError?.message}</ThemedText>
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
        </RefreshableScrollView>
      </View>
    );
  }


  const handleRefresh = async () => {
    if (selectedTab?.type === 'semester') {
      await refresh({ semester: selectedTab.semester, year: selectedTab.year });
    } else {
      await refresh(null);
    }
  };

  const handleTabIndexChange = (index: number) => {
    const route = routes[index];
    if (!route || route.key === selectedTabKey) {
      return;
    }

    setSelectedTabKey(route.key);
  };

  const renderScene = ({ route }: { route: TabsRoute }) => {
    const item = tabMap[route.key];

    if (!item || !overview) {
      return <View onLayout={handleSceneLayout(route.key)} />;
    }

    return (
      <View onLayout={handleSceneLayout(route.key)}>
        {item.type === 'overview' ? (
          <SemestersSection
            certiSummary={item.certificated}
            recordedSummary={item.recorded}
            semesters={semesters}
          />
        ) : (
          <SemesterSection
            certiSummary={overview.certificated}
            semester={item.semester}
            semesterGrade={item.data}
            year={item.year}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <RefreshableScrollView
        onRefresh={handleRefresh}
        onScroll={scrollHandler}
        refreshing={isLoading || isGraduationLoading}
        scrollEventThrottle={16}
      >
        <SafeContainer>
          {Platform.OS === 'ios' && <Space gap={2} />}
          <View style={styles.topView}>
            <View style={styles.topInnerView}>
              <Pressable onPress={toggleBlur}>
                <Header
                  action={
                    isBlurred ? (
                      <EyeOffIcon color={styles.eyeOffIcon.color} size={styles.eyeOffIcon.size} />
                    ) : (
                      <EyeIcon color={styles.eyeIcon.color} size={styles.eyeIcon.size} />
                    )
                  }
                  title="성적"
                />
              </Pressable>
              <ThemedText typography="labelMd">{selectedTabKey}</ThemedText>
              <Space gap={1} />
            </View>
            <GradeSummarySection
              graduationGeneral={graduation.general}
              graduationStudent={graduation.student}
              isSemesterSummary={!!selectedSemesterData}
              summary={displayedSummary}
            />
            <Space gap={1} />
            <GradeSequenceGraphSection
              selectedSemester={selectedSemesterData?.semester}
              selectedYear={selectedSemesterData?.year}
              semesters={semesters}
            />
          </View>
          {routes.length > 0 ? (
            <TabView
              initialLayout={{ width }}
              navigationState={navigationState}
              onIndexChange={handleTabIndexChange}
              renderScene={renderScene}
              renderTabBar={(props) => <TabsTabBar {...props} onLayout={handleTabBarLayout} />}
              style={{ height: tabViewHeight }}
              swipeEnabled={routes.length > 1}
            />
          ) : null}
          <Space gap={8} />
        </SafeContainer>
      </RefreshableScrollView>
      <FloatingHeader label={selectedTabKey} scrollY={scrollY} title="성적" />
    </View>
  );
}

export default function Index() {
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
      <BlurGradeProvider>
        <GradesContent />
      </BlurGradeProvider>
    </>
  );
}
