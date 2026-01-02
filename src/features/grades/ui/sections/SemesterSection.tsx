import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useClassGrades } from '@/entities/grades/lib/queries';
import { GradeSummaryEntity, SemesterGradeEntity } from '@/entities/grades/model';
import { AttributesView } from '@/features/grades/ui/AttributesView';
import { ClassGradeItem } from '@/features/grades/ui/ClassGradeItem';
import { EstimatedGradesSection } from '@/features/grades/ui/sections/EstimatedGradesSection';
import { semesterToString } from '@/shared/lib/semester';
import { CardView } from '@/shared/ui/containers/CardView';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

interface SemesterSectionProps {
  certiSummary?: GradeSummaryEntity;
  semester: number;
  semesterGrade?: SemesterGradeEntity;
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
  classGradesView: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export function SemesterSection({
  semesterGrade,
  semester,
  year,
  certiSummary,
}: SemesterSectionProps) {
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
        {semesterGrade ? (
          <AttributesView
            items={[
              {
                label: '취득 / 신청 학점 (P/F 학점)',
                value: `${semesterGrade.earnedCredits.toFixed(1)}`,
                base: `${semesterGrade.attemptedCredits.toFixed(1)} (${semesterGrade.pfEarnedCredits.toFixed(1)})`,
              },
              {
                label: '평점평균',
                value: `${semesterGrade.gradePointsAverage.toFixed(2)}`,
                base: '4.50',
              },
              {
                label: '산술평균',
                value: `${semesterGrade.arithmeticMean.toFixed(1)}`,
                base: '100',
              },
              { label: '평점계', value: semesterGrade.gradePointsSum.toFixed(1) },
              {
                label: '학기별석차',
                value: `${semesterGrade.semesterRankFirst}`,
                base: `${semesterGrade.semesterRankSecond}`,
              },
              {
                label: '전체석차',
                value: `${semesterGrade.generalRankFirst}`,
                base: `${semesterGrade.generalRankSecond}`,
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
      {!semesterGrade && (
        <EstimatedGradesSection certiSummary={certiSummary} classGrades={classGrades} />
      )}
      <CardView style={{ paddingHorizontal: 0 }}>
        <ThemedText style={{ paddingHorizontal: 16 }} typography="headingLg">
          과목별 성적
        </ThemedText>

        <View style={styles.classGradesView}>
          {classGrades?.map((classGrade) => (
            <ClassGradeItem key={classGrade.code} {...classGrade} />
          ))}
        </View>
      </CardView>
    </View>
  );
}
