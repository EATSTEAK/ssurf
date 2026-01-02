import { View } from 'react-native';

import { ClassGradeEntity, GradeSummaryEntity } from '@/entities/grades/model';
import { rankToRating } from '@/features/grades/lib/utils';
import { AttributesView } from '@/features/grades/ui/AttributesView';
import { CardView } from '@/shared/ui/containers/CardView';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

interface EstimatedGradesSectionProps {
  certiSummary?: GradeSummaryEntity;
  classGrades: ClassGradeEntity[];
}

export const EstimatedGradesSection = ({
  certiSummary,
  classGrades,
}: EstimatedGradesSectionProps) => {
  const { gradeSum, pfPointSum, normalPointSum } = classGrades?.reduce(
    ({ gradeSum, pfPointSum, normalPointSum }, classGrade) => ({
      gradeSum: gradeSum + classGrade.gradePoints * (rankToRating(classGrade.rank) ?? 0),
      pfPointSum: pfPointSum + (classGrade.scoreType === 'Pass' ? classGrade.gradePoints : 0),
      normalPointSum:
        normalPointSum +
        (classGrade.scoreType === 'Score' && classGrade.rank !== 'F' ? classGrade.gradePoints : 0),
    }),
    { gradeSum: 0, pfPointSum: 0, normalPointSum: 0 },
  ) ?? { gradeSum: 0, pfPointSum: 0, normalPointSum: 0 };
  const gpa = gradeSum / normalPointSum;

  // 평점계
  const totalGradeSum = certiSummary ? certiSummary.gradePointsSum + gradeSum : null;
  // P/F 학점 제외 취득 학점
  const totalNormalPointSum = certiSummary
    ? certiSummary.earnedCredits - certiSummary.pfEarnedCredits + normalPointSum
    : null;
  //  취득한 P/F 학점
  const totalPfPointSum = certiSummary ? certiSummary.pfEarnedCredits + pfPointSum : null;
  // 전체 평점평균
  const totalGpa = totalNormalPointSum ? totalGradeSum! / totalNormalPointSum : null;

  const estimatedGradeItems = [
    {
      label: '수강 학점 (P/F 학점)',
      value: (normalPointSum + pfPointSum).toFixed(1),
      base: `(${pfPointSum.toFixed(1)})`,
    },
    {
      label: '학기 평점평균',
      value: gpa.toFixed(2),
      base: '4.50',
    },
  ];

  if (
    certiSummary &&
    totalGpa !== null &&
    totalNormalPointSum !== null &&
    totalPfPointSum !== null
  ) {
    estimatedGradeItems.push(
      {
        label: '전체 취득 학점 (P/F 학점)',
        value: (totalNormalPointSum + totalPfPointSum).toFixed(1),
        base: `(${totalPfPointSum.toFixed(1)})`,
      },
      {
        label: '전체 평점평균',
        value: totalGpa.toFixed(2),
        base: '4.50',
      },
    );
  }
  return (
    <CardView>
      <View>
        <ThemedText typography="headingLg">SSURF 추산 성적</ThemedText>
        <ThemedText color="fgSurfaceMuted" typography="labelSm">
          최종 성적이 아닌 SSURF에서 계산한 성적이에요. 최종 성적과 다를 수 있어요.
        </ThemedText>
      </View>
      <AttributesView items={estimatedGradeItems} />
    </CardView>
  );
};
