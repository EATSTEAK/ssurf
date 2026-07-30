import type {
  CourseInformationEntity,
  CourseScheduleEntity,
} from '@/entities/courseSchedule/model';
import type { SemesterType } from '@rusaint/react-native';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useCourseInformationCandidates } from '@/entities/courseSchedule/lib/queries';
import {
  findBestCourseMatches,
  formatTimeRange,
  WEEKDAY_LABELS,
} from '@/features/schedule/lib/utils';
import { CourseDetailRow, CourseDetailSection } from '@/features/schedule/ui/CourseDetailSection';
import { ChevronRightIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    backgroundColor: theme.colors.surface,
    flex: 1,
  },
  content: {
    gap: theme.gap(2),
    padding: theme.gap(2),
    paddingBottom: theme.gap(6),
  },
  heading: {
    gap: theme.gap(0.5),
  },
  loading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(1),
  },
  candidate: (selected: boolean) => ({
    backgroundColor: theme.colors.surfaceDimmer,
    borderColor: selected ? theme.colors.primary : 'transparent',
    borderCurve: 'continuous',
    borderRadius: theme.cornerRadius.md,
    borderWidth: 2,
    gap: theme.gap(0.5),
    padding: theme.gap(1.5),
  }),
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
    opacity: disabled ? 0.5 : 1,
    padding: theme.gap(2),
  }),
}));

type RouteParam = string | string[] | undefined;

type CourseRouteParams = {
  classroom?: RouteParam;
  endTime?: RouteParam;
  name?: RouteParam;
  professor?: RouteParam;
  semester?: RouteParam;
  startTime?: RouteParam;
  weekday?: RouteParam;
  year?: RouteParam;
};

type ScheduleRouteItem = Omit<CourseScheduleEntity, 'studentId'>;

const candidateId = (candidate: CourseInformationEntity) =>
  `${candidate.code}:${candidate.division}`;

const listLectures = (items: { code: string; name: string }[]) =>
  items.map((item) => `${item.code} ${item.name}`).join('\n');

const singleParam = (value: RouteParam) => (typeof value === 'string' ? value : null);

const parseCourseRouteParams = (params: CourseRouteParams): null | ScheduleRouteItem => {
  const classroom = singleParam(params.classroom);
  const endTimeParam = singleParam(params.endTime);
  const name = singleParam(params.name);
  const professor = singleParam(params.professor);
  const semesterParam = singleParam(params.semester);
  const startTimeParam = singleParam(params.startTime);
  const weekdayParam = singleParam(params.weekday);
  const yearParam = singleParam(params.year);

  if (
    classroom === null ||
    endTimeParam === null ||
    !name?.trim() ||
    professor === null ||
    semesterParam === null ||
    startTimeParam === null ||
    weekdayParam === null ||
    yearParam === null
  ) {
    return null;
  }

  const endTime = Number(endTimeParam);
  const semester = Number(semesterParam);
  const startTime = Number(startTimeParam);
  const weekday = Number(weekdayParam);
  const year = Number(yearParam);

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100 ||
    !Number.isInteger(semester) ||
    semester < 0 ||
    semester > 3 ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6 ||
    !Number.isInteger(startTime) ||
    !Number.isInteger(endTime) ||
    startTime < 0 ||
    endTime > 24 * 60 ||
    endTime <= startTime
  ) {
    return null;
  }

  return { classroom, endTime, name, professor, semester, startTime, weekday, year };
};

const CourseScreen = ({ schedule }: { schedule: ScheduleRouteItem }) => {
  const router = useRouter();
  const { theme } = useUnistyles();
  const [selectedId, setSelectedId] = useState<null | string>(null);
  const { data, error, hasLoaded, isSyncing, refresh } = useCourseInformationCandidates(
    schedule.year,
    schedule.semester as SemesterType,
  );
  const matches = findBestCourseMatches(schedule, data);
  const selected =
    matches.find((candidate) => candidateId(candidate) === selectedId) ??
    (matches.length === 1 ? matches[0] : null);
  const lecture = selected?.lecture;
  const detail = selected?.detail;

  const openSyllabus = () => {
    if (!lecture?.syllabus || !selected) {
      return;
    }

    router.push({
      pathname: '/(tabs)/schedule/course/syllabus',
      params: {
        code: selected.code,
        name: selected.name,
        semester: String(schedule.semester),
        year: String(schedule.year),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: schedule.name }} />
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.root}
      >
        <View style={styles.heading}>
          <ThemedText selectable typography="heading2xl">
            {schedule.name}
          </ThemedText>
          <ThemedText color="fgSecondary" selectable typography="bodyLg">
            {schedule.professor}
          </ThemedText>
        </View>

        <CourseDetailSection title="내 시간표">
          <CourseDetailRow
            label="시간"
            value={`${WEEKDAY_LABELS[schedule.weekday]} ${formatTimeRange(
              schedule.startTime,
              schedule.endTime,
            )}`}
          />
          <CourseDetailRow label="강의실" value={schedule.classroom} />
        </CourseDetailSection>

        {matches.length > 1 ? (
          <CourseDetailSection title="분반 선택">
            {matches.map((candidate) => {
              const id = candidateId(candidate);
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedId === id }}
                  key={id}
                  onPress={() => setSelectedId(id)}
                  style={({ pressed }) => [
                    styles.candidate(selectedId === id),
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText typography="headingMd">
                    {candidate.code}
                    {candidate.division ? ` · ${candidate.division}분반` : ''}
                  </ThemedText>
                  <ThemedText color="fgSecondary" typography="bodyMd">
                    {candidate.professor} · {candidate.scheduleRoom}
                  </ThemedText>
                </Pressable>
              );
            })}
          </CourseDetailSection>
        ) : null}

        {!selected && matches.length <= 1 ? (
          <CourseDetailSection title="추가 정보">
            {isSyncing || (!hasLoaded && !error) ? (
              <View style={styles.loading}>
                <ActivityIndicator accessibilityLabel="전체 과목 정보 불러오는 중" />
                <ThemedText typography="bodyLg">전체 과목 정보를 불러오는 중이에요.</ThemedText>
              </View>
            ) : (
              <>
                <ThemedText color={error ? 'error' : 'fgSecondary'} selectable typography="bodyLg">
                  {error?.message ?? '일치하는 과목 정보를 찾지 못했어요.'}
                </ThemedText>
                <Button onPress={() => void refresh()} variant="outline">
                  다시 시도
                </Button>
              </>
            )}
          </CourseDetailSection>
        ) : null}

        {lecture ? (
          <CourseDetailSection title="과목 정보">
            <CourseDetailRow label="과목번호" value={lecture.code} />
            <CourseDetailRow label="분반" value={lecture.division} />
            <CourseDetailRow label="이수구분" value={lecture.category} />
            <CourseDetailRow label="다전공 이수구분" value={lecture.subCategory} />
            <CourseDetailRow label="공학인증" value={lecture.abeekInfo} />
            <CourseDetailRow label="교과영역" value={lecture.field} />
            <CourseDetailRow label="개설학과" value={lecture.department} />
            <CourseDetailRow label="시간/학점" value={lecture.timePoints} />
            <CourseDetailRow label="수강인원" value={lecture.personeel} />
            <CourseDetailRow label="여석" value={lecture.remainingSeats} />
            <CourseDetailRow label="강의시간/강의실" value={lecture.scheduleRoom} />
            <CourseDetailRow label="수강대상" value={lecture.target} />
          </CourseDetailSection>
        ) : null}

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

        {lecture ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !lecture.syllabus }}
            disabled={!lecture.syllabus}
            onPress={openSyllabus}
            style={({ pressed }) => [styles.syllabus(!lecture.syllabus), pressed && styles.pressed]}
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
        ) : null}
      </ScrollView>
    </>
  );
};

export default function CourseRoute() {
  const schedule = parseCourseRouteParams(useLocalSearchParams<CourseRouteParams>());

  if (!schedule) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: '과목 정보' }} />
        <View style={[styles.root, styles.content]}>
          <ThemedText color="error" typography="bodyLg">
            잘못된 과목 정보예요.
          </ThemedText>
        </View>
      </>
    );
  }

  return <CourseScreen schedule={schedule} />;
}
