import { CourseType } from '@rusaint/react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { CardView } from '@/components/containers/CardView';
import { SafeContainer } from '@/components/containers/Container';
import { RefreshableScrollView } from '@/components/containers/RefreshableScrollView';
import { FloatingHeader } from '@/components/headers/FloatingHeader';
import { Header } from '@/components/headers/Header';
import { Space } from '@/components/primitives/Space';
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

export default function Index() {
  const { sync: syncGradeSummary, isSyncing, error } = useSyncGradeSummary();
  const {
    sync: syncSemesterGrades,
    isSyncing: isSemesterSyncing,
    error: semesterError,
  } = useSyncSemesterGrades();
  const { data: summary } = useGradeSummary('certificated');
  const { data: semesters } = useSemesterGrades();

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

  if (!summary || !semesters) {
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '성적',
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
              <Space gap={1} />
              <View>
                <ThemedText typography="headingLg">평점 평균</ThemedText>
                <ThemedText typography="heading3xl">
                  {Math.round(summary.gradePointsAverage * 1000) / 1000}
                </ThemedText>
                <ThemedText typography="bodyLg">
                  {summary.earnedCredits} / {summary.attemptedCredits} 학점 수강
                </ThemedText>

                <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                  <View
                    style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}
                  >
                    <ThemedText style={{ fontWeight: 600 }} typography="labelLg">
                      산술평균
                    </ThemedText>
                    <ThemedText typography="bodyLg">{summary.arithmeticMean}</ThemedText>
                  </View>
                  <View
                    style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}
                  >
                    <ThemedText style={{ fontWeight: 600 }} typography="labelLg">
                      평점계
                    </ThemedText>
                    <ThemedText typography="bodyLg">
                      {Math.round(summary.gradePointsSum * 1000) / 1000}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
            <CardView>
              <ThemedText typography="headingLg">학기별 정보</ThemedText>
              {semesters?.map((semester) => (
                <View
                  key={`${semester.year}-${semester.semester}`}
                  style={{ marginTop: 16, gap: 4 }}
                >
                  <ThemedText typography="headingMd">
                    {semesterToString({ year: semester.year, semester: semester.semester })}
                  </ThemedText>
                  <ThemedText typography="bodyLg">
                    평점 평균:{' '}
                    <ThemedText style={{ fontWeight: 600 }} typography="bodyLg">
                      {Math.round(semester.gradePointsAverage * 1000) / 1000}
                    </ThemedText>
                  </ThemedText>
                </View>
              ))}
            </CardView>
            <Space gap={8} />
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader scrollY={scrollY} title="성적" />
      </View>
    </>
  );
}
