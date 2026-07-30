import type { LectureSyllabus, SemesterType } from '@rusaint/react-native';

import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useCourseSyllabus } from '@/entities/courseSchedule/lib/queries';
import { CourseDetailRow, CourseDetailSection } from '@/features/schedule/ui/CourseDetailSection';
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
  loading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(1),
  },
}));

type RouteParam = string | string[] | undefined;

type SyllabusRouteParams = {
  code?: RouteParam;
  name?: RouteParam;
  semester?: RouteParam;
  year?: RouteParam;
};

const lines = (values: (null | string | undefined)[]) =>
  values.filter((value): value is string => Boolean(value?.trim())).join('\n');

const singleParam = (value: RouteParam) => (typeof value === 'string' ? value : null);

const parseSyllabusRouteParams = (params: SyllabusRouteParams) => {
  const code = singleParam(params.code);
  const name = singleParam(params.name);
  const semesterParam = singleParam(params.semester);
  const yearParam = singleParam(params.year);
  if (!code?.trim() || !name?.trim() || semesterParam === null || yearParam === null) {
    return null;
  }

  const semester = Number(semesterParam);
  const year = Number(yearParam);
  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100 ||
    !Number.isInteger(semester) ||
    semester < 0 ||
    semester > 3
  ) {
    return null;
  }

  return { code, name, semester: semester as SemesterType, year };
};

const SyllabusContent = ({
  code,
  name,
  semester,
  year,
}: {
  code: string;
  name: string;
  semester: SemesterType;
  year: number;
}) => {
  const { data, error, isSyncing, refresh } = useCourseSyllabus(year, semester, code, name);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '강의계획서' }} />
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.root}
      >
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
      </ScrollView>
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
  const syllabus = parseSyllabusRouteParams(useLocalSearchParams<SyllabusRouteParams>());

  if (!syllabus) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: '강의계획서' }} />
        <View style={[styles.root, styles.content]}>
          <ThemedText color="error" typography="bodyLg">
            잘못된 강의계획서 정보예요.
          </ThemedText>
        </View>
      </>
    );
  }

  return <SyllabusContent {...syllabus} />;
}
