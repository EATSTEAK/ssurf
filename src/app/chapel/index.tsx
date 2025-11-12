import { SemesterType } from '@rusaint/react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Attendance } from '@/components/chapel/Attendance';
import { ChapelProgress } from '@/components/chapel/ChapelProgress';
import { Button } from '@/components/primitives/Button';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
import { useChapelAttendances, useGeneralChapelInformation } from '@/hooks/chapel/chapel';
import { SsurfLined } from '@/icons/SsurfLined';

export default function Index() {
  const { logout } = useRusaintSession();
  const { data: general } = useGeneralChapelInformation(2025, SemesterType.Two);
  const { data: attendances } = useChapelAttendances(2025, SemesterType.Two);

  const totalAttendances = attendances?.length ?? 0;
  const requiredAttendances = Math.ceil(totalAttendances * (2 / 3));
  const attendedCount = attendances?.filter((a) => a.attendance === '출석').length ?? 0;
  const absentCount = attendances?.filter((a) => a.attendance === '결석').length ?? 0;
  const attendanceLeft = requiredAttendances - attendedCount;
  const passable = totalAttendances - absentCount >= requiredAttendances;

  if (!general) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 10,
        padding: 20,
      }}
    >
      <View style={{ display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' }}>
        <SsurfLined height={32} width={32} />
        <ThemedText style={{ fontWeight: '600' }} typography="heading2xl">
          채플 정보
        </ThemedText>
      </View>
      <ThemedText typography="labelMd">
        {general.year}-{general.semester}학기
      </ThemedText>
      {attendanceLeft <= 0 ? (
        <ThemedText color="primary" typography="headingXl">
          축하해요! 이번 학기 PASS했어요!
        </ThemedText>
      ) : passable ? (
        <ThemedText typography="headingXl">
          {attendanceLeft}회 더 출석해야 PASS할 수 있어요
        </ThemedText>
      ) : (
        <ThemedText typography="headingXl">아쉽지만 이번 학기에는 PASS할 수 없어요</ThemedText>
      )}
      <ChapelProgress
        attendanceLeft={attendanceLeft}
        attendedArray={
          attendances?.filter((a) => a.attendance !== '').map((a) => a.attendance === '출석') || []
        }
        totalAttendances={totalAttendances}
      />
      <ThemedText style={{ alignSelf: 'flex-end' }}>
        {attendedCount}/{totalAttendances} 출석 {absentCount > 0 ? `/ 결석 ${absentCount}회` : ''}
      </ThemedText>
      <ThemedText typography="bodyLg">{general.time}</ThemedText>
      <View style={{ marginTop: 10 }} />
      <ThemedText typography="heading2xl">좌석 정보</ThemedText>
      <ThemedText typography="headingXl">
        {general.floor}F / {general.seat}
      </ThemedText>
      <ScrollView
        contentContainerStyle={{ display: 'flex', gap: 10 }}
        style={{ width: '100%', marginTop: 20 }}
      >
        {attendances &&
          attendances.map((attendance) => (
            <Attendance attendance={attendance} key={attendance.date} />
          ))}
      </ScrollView>
      <Button onPress={logout} variant="primary">
        로그아웃
      </Button>
    </SafeAreaView>
  );
}
