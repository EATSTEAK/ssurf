import type { SemesterType } from '@rusaint/react-native';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useCourseInformationByCode } from '@/entities/courseSchedule/lib/queries';
import {
  type CourseScheduleRouteParams,
  parseCourseCode,
  parseCourseScheduleRouteParams,
  type RouteParam,
  type ScheduleRouteItem,
} from '@/features/schedule/lib/courseRoute';
import { formatTimeRange, WEEKDAY_LABELS } from '@/features/schedule/lib/utils';
import { CourseDetailRow, CourseDetailSection } from '@/features/schedule/ui/CourseDetailSection';
import { parseSemesterSlug, semesterToString } from '@/shared/lib/semester';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { ChevronRightIcon } from '@/shared/ui/icons';
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
  pressed: {
    opacity: 0.7,
  },
  syllabus: (disabled: boolean) => ({
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDim,
    borderCurve: 'continuous',
    borderRadius: theme.cornerRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: theme.gap(2),
    opacity: disabled ? 0.5 : 1,
    padding: theme.gap(2),
  }),
}));

type CourseRouteParams = CourseScheduleRouteParams & {
  code?: RouteParam;
  term?: RouteParam;
};

const listLectures = (items: { code: string; name: string }[]) =>
  items.map((item) => `${item.code} ${item.name}`).join('\n');

const CourseScreen = ({
  code,
  schedule,
  semester,
  term,
  year,
}: {
  code: string;
  schedule: null | ScheduleRouteItem;
  semester: SemesterType;
  term: string;
  year: number;
}) => {
  const router = useRouter();
  const { theme } = useUnistyles();
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const { data, error, isSyncing, refresh } = useCourseInformationByCode(year, semester, code);
  const lecture = data?.lecture;
  const detail = data?.detail;
  const subtitle = lecture ? `${lecture.name} / ${lecture.professor}` : code;

  const openSyllabus = () => {
    if (!lecture?.syllabus) {
      return;
    }

    router.push({
      pathname: '/(tabs)/schedule/course/[term]/[code]/syllabus',
      params: { code, term },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerBackVisible: true,
          headerShown: true,
          headerTitle: () => <></>,
          headerTransparent: true,
          title: '과목 상세',
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
              <Header title="과목 상세" />
              <ThemedText color="fgSecondary" selectable typography="bodyLg">
                {subtitle}
              </ThemedText>
            </View>

            {!lecture ? (
              <CourseDetailSection title="과목 정보">
                {isSyncing || !error ? (
                  <View style={styles.loading}>
                    <ActivityIndicator accessibilityLabel="과목 정보 불러오는 중" />
                    <ThemedText typography="bodyLg">과목 정보를 불러오는 중이에요.</ThemedText>
                  </View>
                ) : (
                  <>
                    <ThemedText color="error" selectable typography="bodyLg">
                      {error.message}
                    </ThemedText>
                    <Button onPress={refresh} variant="outline">
                      다시 시도
                    </Button>
                  </>
                )}
              </CourseDetailSection>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !lecture.syllabus }}
                  disabled={!lecture.syllabus}
                  onPress={openSyllabus}
                  style={({ pressed }) => [
                    styles.syllabus(!lecture.syllabus),
                    pressed && styles.pressed,
                  ]}
                >
                  <View>
                    <ThemedText typography="headingLg">강의계획서</ThemedText>
                    <ThemedText color="fgSecondary" typography="bodyMd">
                      {lecture.syllabus ? '전체 강의계획서 보기' : '등록된 강의계획서가 없어요.'}
                    </ThemedText>
                  </View>
                  {lecture.syllabus ? (
                    <ChevronRightIcon color={theme.colorsHex.fgSurface} size={20} />
                  ) : null}
                </Pressable>

                {schedule ? (
                  <CourseDetailSection title="내 시간표">
                    <CourseDetailRow
                      label="학기"
                      value={semesterToString({ semester, year: schedule.year })}
                    />
                    <CourseDetailRow
                      label="시간"
                      value={`${WEEKDAY_LABELS[schedule.weekday]} ${formatTimeRange(
                        schedule.startTime,
                        schedule.endTime,
                      )}`}
                    />
                    <CourseDetailRow label="강의실" value={schedule.classroom} />
                  </CourseDetailSection>
                ) : null}

                <CourseDetailSection title="과목 정보">
                  <CourseDetailRow label="학기" value={semesterToString({ semester, year })} />
                  <CourseDetailRow label="과목번호" value={lecture.code} />
                  <CourseDetailRow label="분반" value={lecture.division} />
                  <CourseDetailRow label="이수구분" value={lecture.category} />
                  <CourseDetailRow label="다전공 이수구분" value={lecture.subCategory} />
                  <CourseDetailRow label="공학인증" value={lecture.abeekInfo} />
                  <CourseDetailRow label="교과영역" value={lecture.field} />
                  <CourseDetailRow label="개설학과" value={lecture.department} />
                  <CourseDetailRow label="담당교수" value={lecture.professor} />
                  <CourseDetailRow label="시간/학점" value={lecture.timePoints} />
                  <CourseDetailRow label="수강인원" value={lecture.personeel} />
                  <CourseDetailRow label="여석" value={lecture.remainingSeats} />
                  <CourseDetailRow label="강의시간/강의실" value={lecture.scheduleRoom} />
                  <CourseDetailRow label="수강대상" value={lecture.target} />
                </CourseDetailSection>

                {detail?.categories.length ? (
                  <CourseDetailSection title="과목 분류">
                    <CourseDetailRow label="분류" value={detail.categories.join('\n')} />
                  </CourseDetailSection>
                ) : null}

                {detail?.prerequisites.length ? (
                  <CourseDetailSection title="선수 과목">
                    <CourseDetailRow label="과목" value={listLectures(detail.prerequisites)} />
                  </CourseDetailSection>
                ) : null}

                {detail?.alternativeLectures.length ? (
                  <CourseDetailSection title="대체 과목">
                    {detail.alternativeLectures.map((item) => (
                      <CourseDetailRow
                        key={`${item.kind}:${item.code}`}
                        label={item.kind}
                        value={`${item.code} ${item.name}`}
                      />
                    ))}
                  </CourseDetailSection>
                ) : null}

                {detail?.changesHistory.length ? (
                  <CourseDetailSection title="강의 변경 이력">
                    {detail.changesHistory.map((item) => (
                      <CourseDetailRow
                        key={`${item.startDate}:${item.endDate}:${item.name}`}
                        label={`${item.startDate} - ${item.endDate}`}
                        value={item.name}
                      />
                    ))}
                  </CourseDetailSection>
                ) : null}
              </>
            )}
          </SafeContainer>
        </Animated.ScrollView>
        <FloatingHeader label={subtitle} scrollY={scrollY} title="과목 상세" />
      </View>
    </>
  );
};

export default function CourseRoute() {
  const params = useLocalSearchParams<CourseRouteParams>();
  const term = typeof params.term === 'string' ? params.term : null;
  const parsedSemester = term ? parseSemesterSlug(term) : null;
  const code = parseCourseCode(params.code);

  if (!term || !parsedSemester || !code) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: '과목 상세' }} />
        <View style={[styles.root, styles.content, styles.heading]}>
          <ThemedText color="error" typography="bodyLg">
            잘못된 과목 정보예요.
          </ThemedText>
        </View>
      </>
    );
  }

  return (
    <CourseScreen
      code={code}
      schedule={parseCourseScheduleRouteParams(params)}
      semester={parsedSemester.semester}
      term={term}
      year={parsedSemester.year}
    />
  );
}
