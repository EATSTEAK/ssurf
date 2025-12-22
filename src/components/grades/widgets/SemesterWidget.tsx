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
  semester: SemesterGradeDto;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    display: 'flex',
    gap: theme.gap(2),
  },
}));

export function SemesterWidget({ semester }: SemesterWidgetProps) {
  const { data: classGrades } = useClassGrades(semester.year, semester.semester);

  return (
    <View style={styles.container}>
      <CardView>
        <ThemedText typography="headingLg">
          {semesterToString({
            year: semester.year,
            semester: semester.semester,
          })}
        </ThemedText>
        <AttributesView
          items={[
            {
              label: '취득 / 신청 학점 (P/F 학점)',
              value: `${semester.earnedCredits} / ${semester.attemptedCredits} (${semester.pfEarnedCredits})`,
            },
            {
              label: '평점평균',
              value: `${Math.round(semester.gradePointsAverage * 1000) / 1000} / 4.5`,
            },
            {
              label: '산술평균',
              value: `${Math.round(semester.arithmeticMean * 1000) / 1000} / 100`,
            },
            { label: '평점계', value: Math.round(semester.gradePointsSum * 1000) / 1000 },
            {
              label: '학기별석차',
              value: `${semester.semesterRankFirst}/${semester.semesterRankSecond}`,
            },
            {
              label: '전체석차',
              value: `${semester.generalRankFirst}/${semester.generalRankSecond}`,
            },
          ]}
        />
      </CardView>
      <CardView>
        <ThemedText typography="headingLg">과목별 성적</ThemedText>
        {classGrades?.map((classGrade) => (
          <View key={classGrade.code} style={{ marginTop: 16 }}>
            <ClassGradeItem
              className={classGrade.className}
              gradePoints={classGrade.gradePoints}
              professor={classGrade.professor}
              rank={classGrade.rank}
            />
          </View>
        ))}
      </CardView>
    </View>
  );
}
