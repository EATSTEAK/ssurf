import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { useGradeTabView } from '@/features/grades/lib/useGradeTabView';
import { GradeOverviewTabView, GradeTabView, SemesterGradeTabView } from '@/features/grades/model';
import { BlurGradeProvider, useBlurGrade } from '@/features/grades/providers/BlurGradeProvider';
import { GradeSequenceGraphWidget } from '@/features/grades/ui/sections/GradeSequenceGraphSection';
import { GradeSummaryWidget } from '@/features/grades/ui/sections/GradeSummarySection';
import { SemesterWidget } from '@/features/grades/ui/sections/SemesterSection';
import { SemestersWidget } from '@/features/grades/ui/sections/SemestersSection';
import { semesterToString } from '@/shared/lib/semester';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { EyeIcon, EyeOffIcon } from '@/shared/ui/icons';
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
  const { data, error, isLoading, refresh } = useGradeTabView();
  const [selectedTabKey, setSelectedTabKey] = useState<string>(SUMMARY_LABEL);
  const { isBlurred, toggleBlur } = useBlurGrade();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const tabMap = useMemo(
    () => Object.fromEntries((data ?? []).map((item) => [getTabKey(item), item])),
    [data],
  );

  const handleErrorRefresh = async () => {
    // 로딩 중이면 리프레시하지 않음
    if (isLoading) {
      return;
    }
    await refresh(null);
  };

  if (!data) {
    return (
      <View style={styles.root}>
        <RefreshableScrollView onRefresh={handleErrorRefresh} refreshing={isLoading}>
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
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

  const tabs = data.map(getTabKey);
  const overview = data.find((item): item is GradeOverviewTabView => item.type === 'overview');
  const semesters = data
    .filter((item): item is SemesterGradeTabView => item.type === 'semester')
    .map((item) => item.data)
    .filter((s) => s !== undefined);

  const selectedTab = tabMap[selectedTabKey];
  const selectedSemesterData = selectedTab?.type === 'semester' ? selectedTab.data : undefined;
  const displayedSummary = selectedSemesterData ?? overview!.certificated;

  const handleTabSelect = (key: string) => {
    setSelectedTabKey(key);
  };

  const handleRefresh = async () => {
    if (selectedTab?.type === 'semester') {
      await refresh({ semester: selectedTab.semester, year: selectedTab.year });
    } else {
      await refresh(null);
    }
  };

  const renderItem = (item: GradeTabView) => {
    if (item.type === 'overview') {
      return (
        <SemestersWidget
          certiSummary={item.certificated}
          recordedSummary={item.recorded}
          semesters={semesters}
        />
      );
    }

    return <SemesterWidget data={item.data} semester={item.semester} year={item.year} />;
  };

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
          refreshing={isLoading}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
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
              <GradeSummaryWidget summary={displayedSummary} />
              <Space gap={1} />
              <GradeSequenceGraphWidget
                selectedSemester={selectedSemesterData?.semester}
                selectedYear={selectedSemesterData?.year}
                semesters={semesters}
              />
            </View>
            <Tabs.Root onValueChange={handleTabSelect} value={selectedTabKey}>
              <Tabs.List>
                {tabs.map((tab) => (
                  <Tabs.Trigger key={tab} value={tab} />
                ))}
              </Tabs.List>
            </Tabs.Root>
            <AutoHeightFlatList
              data={data}
              keyExtractor={getTabKey}
              onPageChange={handleTabSelect}
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

export default function Index() {
  return (
    <BlurGradeProvider>
      <GradesContent />
    </BlurGradeProvider>
  );
}
