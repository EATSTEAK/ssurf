import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CardView } from '@/components/containers/CardView';
import { AttributesView } from '@/components/grades/ui/AttributesView';
import { ClassGradeItem } from '@/components/grades/ui/ClassGradeItem';
import { ThemedText } from '@/components/primitives/ThemedText';
import { SemesterGradeDto } from '@/db/schema/grades';
import { useClassGrades } from '@/hooks/grades/grades';
import { semesterToString } from '@/utils/semester';

interface SemesterWidgetProps {
  data?: SemesterGradeDto;
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
    padding: 32,
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
                value: `${data.earnedCredits} / ${data.attemptedCredits} (${data.pfEarnedCredits})`,
              },
              {
                label: '평점평균',
                value: `${Math.round(data.gradePointsAverage * 1000) / 1000} / 4.5`,
              },
              {
                label: '산술평균',
                value: `${Math.round(data.arithmeticMean * 1000) / 1000} / 100`,
              },
              { label: '평점계', value: Math.round(data.gradePointsSum * 1000) / 1000 },
              {
                label: '학기별석차',
                value: `${data.semesterRankFirst}/${data.semesterRankSecond}`,
              },
              {
                label: '전체석차',
                value: `${data.generalRankFirst}/${data.generalRankSecond}`,
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
          <View key={classGrade.code} style={{ marginTop: 16 }}>
            <ClassGradeItem {...classGrade} />
          </View>
        ))}
      </CardView>
    </View>
  );
}
