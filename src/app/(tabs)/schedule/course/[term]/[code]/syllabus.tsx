import type { LectureSyllabus, SemesterType } from '@rusaint/react-native';

import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Platform, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useCourseSyllabus } from '@/entities/courseSchedule/lib/queries';
import { parseCourseCode, type RouteParam } from '@/features/schedule/lib/courseRoute';
import { CourseDetailRow, CourseDetailSection } from '@/features/schedule/ui/CourseDetailSection';
import { parseSemesterSlug } from '@/shared/lib/semester';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { Button } from '@/shared/ui/primitives/Button';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    backgroundColor: theme.colors.surface,
    flex: 1,
  },
  content: {
    gap: theme.gap(2),
    paddingBottom: theme.gap(6),
    paddingTop: theme.gap(2),
  },
  heading: {
    gap: theme.gap(0.5),
    paddingHorizontal: theme.gap(2),
  },
  loading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(1),
  },
}));

type SyllabusRouteParams = {
  code?: RouteParam;
  term?: RouteParam;
};

const lines = (values: (null | string | undefined)[]) =>
  values.filter((value): value is string => Boolean(value?.trim())).join('\n');

const SyllabusContent = ({
  code,
  semester,
  year,
}: {
  code: string;
  semester: SemesterType;
  year: number;
}) => {
  const { data, error, isSyncing, refresh } = useCourseSyllabus(year, semester, code);
  const subtitle = data ? `${data.courseName} / ${data.professor}` : code;
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerBackVisible: true,
          headerShown: true,
          headerTitle: () => <></>,
          headerTransparent: true,
          title: '강의계획서',
        }}
      />
      <View style={styles.root}>
        <Animated.ScrollView
          contentInsetAdjustmentBehavior="automatic"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          <SafeContainer style={styles.content}>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.heading}>
              <Header title="강의계획서" />
              <ThemedText color="fgSecondary" selectable typography="bodyLg">
                {subtitle}
              </ThemedText>
            </View>
            {!data ? (
              <CourseDetailSection title="강의계획서">
                {isSyncing || !error ? (
                  <View style={styles.loading}>
                    <ActivityIndicator accessibilityLabel="강의계획서 불러오는 중" />
                    <ThemedText typography="bodyLg">강의계획서를 불러오는 중이에요.</ThemedText>
                  </View>
                ) : (
                  <>
                    <ThemedText color="error" selectable typography="bodyLg">
                      {error.message}
                    </ThemedText>
                    <Button onPress={() => void refresh()} variant="outline">
                      다시 시도
                    </Button>
                  </>
                )}
              </CourseDetailSection>
            ) : (
              <SyllabusSections data={data} />
            )}
          </SafeContainer>
        </Animated.ScrollView>
        <FloatingHeader label={subtitle} scrollY={scrollY} title="강의계획서" />
      </View>
    </>
  );
};

const SyllabusSections = ({ data }: { data: LectureSyllabus }) => (
  <>
    <CourseDetailSection title="기본 정보">
      <CourseDetailRow label="교과목명" value={data.courseName} />
      <CourseDetailRow label="과목코드" value={data.courseCode} />
      <CourseDetailRow label="담당교수" value={data.professor} />
      <CourseDetailRow label="학년도/학기" value={lines([data.year, data.semester])} />
      <CourseDetailRow label="학점" value={data.credits} />
      <CourseDetailRow label="이수구분" value={data.designation} />
      <CourseDetailRow label="수강대상" value={data.targetStudents} />
    </CourseDetailSection>

    {lines([
      data.abstractText,
      ...data.learningObjectives,
      data.teachingMethod,
      data.absencePolicy,
    ]) ? (
      <CourseDetailSection title="수업 정보">
        <CourseDetailRow label="강의개요" value={data.abstractText} />
        <CourseDetailRow label="학습목표" value={lines(data.learningObjectives)} />
        <CourseDetailRow label="수업방법" value={data.teachingMethod} />
        <CourseDetailRow label="결석처리" value={data.absencePolicy} />
      </CourseDetailSection>
    ) : null}

    {lines([data.mainTextbook, data.subTextbook]) ? (
      <CourseDetailSection title="교재">
        <CourseDetailRow label="주교재" value={data.mainTextbook} />
        <CourseDetailRow label="부교재" value={data.subTextbook} />
      </CourseDetailSection>
    ) : null}

    {lines([data.professorPhone, data.professorEmail, data.officeHours]) ? (
      <CourseDetailSection title="교수 연락처">
        <CourseDetailRow label="전화번호" value={data.professorPhone} />
        <CourseDetailRow label="이메일" value={data.professorEmail} />
        <CourseDetailRow label="상담시간" value={data.officeHours} />
      </CourseDetailSection>
    ) : null}

    {data.gradingItems.length ? (
      <CourseDetailSection title="성적평가">
        {data.gradingItems.map((item) => (
          <CourseDetailRow key={`${item.name}:${item.rate}`} label={item.name} value={item.rate} />
        ))}
      </CourseDetailSection>
    ) : null}

    {data.competencies.length ? (
      <CourseDetailSection title="핵심역량">
        {data.competencies.map((item) => (
          <CourseDetailRow key={`${item.name}:${item.rate}`} label={item.name} value={item.rate} />
        ))}
      </CourseDetailSection>
    ) : null}

    {data.weeklySchedule.length ? (
      <CourseDetailSection title="주차별 수업계획">
        {data.weeklySchedule.map((item) => (
          <CourseDetailRow
            key={`${item.week}:${item.topic}`}
            label={`${item.week}주차`}
            value={lines([
              item.topic,
              item.details,
              item.teachingMethod ? `수업방법: ${item.teachingMethod}` : null,
            ])}
          />
        ))}
      </CourseDetailSection>
    ) : null}
  </>
);

export default function SyllabusRoute() {
  const params = useLocalSearchParams<SyllabusRouteParams>();
  const term = typeof params.term === 'string' ? params.term : null;
  const semester = term ? parseSemesterSlug(term) : null;
  const code = parseCourseCode(params.code);

  if (!semester || !code) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: '강의계획서' }} />
        <View style={[styles.root, styles.content, styles.heading]}>
          <ThemedText color="error" typography="bodyLg">
            잘못된 강의계획서 정보예요.
          </ThemedText>
        </View>
      </>
    );
  }

  return <SyllabusContent code={code} semester={semester.semester} year={semester.year} />;
}
