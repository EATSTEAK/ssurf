import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

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
import { CollapsibleTabs } from '@/shared/ui/collapsible-tabs/CollapsibleTabs';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { RefreshHeader, RefreshState } from '@/shared/ui/headers/RefreshHeader';
import { EyeIcon, EyeOffIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';
import { TabsRoute, TabsTabBar } from '@/shared/ui/primitives/Tabs';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const NATIVE_TAB_BAR_HEIGHT = 49;

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
  sceneContent: {
    backgroundColor: theme.colors.surface,
    minHeight: '100%',
    paddingBottom: theme.gap(8),
  },
}));

const SUMMARY_LABEL = '전체 학기';

function getTabKey(item: GradeTabView): string {
  if (item.type === 'overview') {
    return SUMMARY_LABEL;
  }
  return semesterToString({ semester: item.semester, year: item.year });
}

const ThemedEyeIcon = withUnistyles(EyeIcon, (theme) => ({
  color: theme.colorsHex.fgSurface,
}));
const ThemedEyeOffIcon = withUnistyles(EyeOffIcon, (theme) => ({
  color: theme.colorsHex.fgSurfaceMuted,
}));

function GradesContent() {
  const { data, error, isLoading, refresh } = useGradeTabView();
  const {
    data: graduation,
    error: graduationError,
    isLoading: isGraduationLoading,
    refresh: graduationRefresh,
  } = useGraduationView();
  const [selectedTabKey, setSelectedTabKey] = useState<string>(SUMMARY_LABEL);
  const { isBlurred, toggleBlur } = useBlurGrade();

  const insets = useSafeAreaInsets();
  const pullDistance = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const refreshState = useSharedValue<RefreshState>(RefreshState.Idle);

  useEffect(() => {
    refreshState.value =
      isLoading || isGraduationLoading ? RefreshState.Syncing : RefreshState.Idle;
  }, [isLoading, isGraduationLoading, refreshState]);

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
  const displayedSummary = selectedSemesterData ??
    overview?.certificated ?? {
      attemptedCredits: 0,
      earnedCredits: 0,
      gradePointsAverage: 0,
    };
  const routes = useMemo<TabsRoute[]>(() => tabs.map((tab) => ({ key: tab, title: tab })), [tabs]);
  const currentIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === selectedTabKey),
  );

  const handleErrorRefresh = async () => {
    if (isLoading || isGraduationLoading) {
      return;
    }
    await refresh(null);
    await graduationRefresh();
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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

  const listBottomPadding =
    NATIVE_TAB_BAR_HEIGHT + insets.bottom + (styles.sceneContent.paddingBottom as number);

  return (
    <View style={styles.root}>
      <SafeContainer edges={['bottom', 'left', 'right']}>
        <CollapsibleTabs.Container
          index={currentIndex}
          onIndexChange={handleTabIndexChange}
          onRefresh={handleRefresh}
          pullDistance={pullDistance}
          refreshing={isLoading || isGraduationLoading}
          renderHeader={() => (
            <SafeContainer edges={['top']}>
              {Platform.OS === 'ios' && <Space gap={2} />}
              <View style={styles.topView}>
                <View style={styles.topInnerView}>
                  <Pressable onPress={toggleBlur}>
                    <Header
                      action={
                        isBlurred ? <ThemedEyeOffIcon size={16} /> : <ThemedEyeIcon size={16} />
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
            </SafeContainer>
          )}
          renderTabBar={(props) => <TabsTabBar {...props} />}
          routes={routes}
        >
          {routes.map((route) => {
            const item = tabMap[route.key];
            return (
              <CollapsibleTabs.Scene key={route.key} routeKey={route.key}>
                <CollapsibleTabs.ScrollView
                  contentContainerStyle={[
                    styles.sceneContent,
                    { paddingBottom: listBottomPadding },
                  ]}
                  onScroll={route.key === selectedTabKey ? scrollHandler : undefined}
                  refreshing={isLoading || isGraduationLoading}
                  scrollEventThrottle={16}
                >
                  {item?.type === 'overview' ? (
                    <SemestersSection
                      certiSummary={item.certificated}
                      recordedSummary={item.recorded}
                      semesters={semesters}
                    />
                  ) : item?.type === 'semester' ? (
                    <SemesterSection
                      certiSummary={overview.certificated}
                      semester={item.semester}
                      semesterGrade={item.data}
                      year={item.year}
                    />
                  ) : null}
                </CollapsibleTabs.ScrollView>
              </CollapsibleTabs.Scene>
            );
          })}
        </CollapsibleTabs.Container>
        <FloatingHeader label={selectedTabKey} scrollY={scrollY} title="성적" />
        <RefreshHeader pullDistance={pullDistance} refreshState={refreshState} />
      </SafeContainer>
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
