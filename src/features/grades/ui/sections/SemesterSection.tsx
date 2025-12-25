import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useClassGrades } from '@/entities/grades/lib/queries';
import { SemesterGradeEntity } from '@/entities/grades/model';
import { AttributesView } from '@/features/grades/ui/AttributesView';
import { ClassGradeItem } from '@/features/grades/ui/ClassGradeItem';
import { semesterToString } from '@/shared/lib/semester';
import { CardView } from '@/shared/ui/containers/CardView';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

interface SemesterWidgetProps {
  data?: SemesterGradeEntity;
  semester: number;
  year: number;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    gap: theme.gap(2),
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.gap(4),
  },
}));

export function SemesterWidget({ data, semester, year }: SemesterWidgetProps) {
  const { data: classGrades } = useClassGrades(year, semester);

  return (
    <View style={styles.container}>
      <CardView>
        <ThemedText typography="headingLg">
          {semesterToString({
            semester,
            year,
          })}
        </ThemedText>
        {data ? (
          <AttributesView
            items={[
              {
                label: '취득 / 신청 학점 (P/F 학점)',
                value: `${data.earnedCredits.toFixed(1)}`,
                base: `${data.attemptedCredits.toFixed(1)} (${data.pfEarnedCredits.toFixed(1)})`,
              },
              {
                label: '평점평균',
                value: `${data.gradePointsAverage.toFixed(2)}`,
                base: '4.50',
              },
              {
                label: '산술평균',
                value: `${data.arithmeticMean.toFixed(1)}`,
                base: '100',
              },
              { label: '평점계', value: data.gradePointsSum.toFixed(1) },
              {
                label: '학기별석차',
                value: `${data.semesterRankFirst}`,
                base: `${data.semesterRankSecond}`,
              },
              {
                label: '전체석차',
                value: `${data.generalRankFirst}`,
                base: `${data.generalRankSecond}`,
              },
            ]}
          />
        ) : (
          <View style={styles.emptyView}>
            <ThemedText typography="bodyLg">아직 최종 성적이 등록되지 않았어요.</ThemedText>
            <ThemedText color="secondary" typography="bodySm">
              학기 중이거나 성적 처리 중일 수 있어요.
            </ThemedText>
          </View>
        )}
      </CardView>
      <CardView>
        <ThemedText typography="headingLg">과목별 성적</ThemedText>
        {classGrades?.map((classGrade) => (
          <ClassGradeItem key={classGrade.code} {...classGrade} />
        ))}
      </CardView>
    </View>
  );
}
