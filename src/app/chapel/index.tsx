import { SemesterType } from '@rusaint/react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/primitives/Button';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
import { useChapelAttendances, useGeneralChapelInformation } from '@/hooks/chapel/chapel';

export default function Index() {
  const { logout } = useRusaintSession();
  const { data: general } = useGeneralChapelInformation(2025, SemesterType.Two);
  const { data: attendances } = useChapelAttendances(2025, SemesterType.Two);

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
      <Button onPress={logout} variant="primary">
        로그아웃
      </Button>
      <ThemedText typography="heading2xl">채플 정보</ThemedText>
      <ThemedText typography="labelSm">
        {general.year}-{general.semester}학기
      </ThemedText>
      <ThemedText>{general.division}</ThemedText>
      <ThemedText>
        {general.floor} / {general.seat}
      </ThemedText>
      <ThemedText>{general.time}</ThemedText>
      <ThemedText>{general.absenceTime}</ThemedText>
      {attendances &&
        attendances.map((attendance) => (
          <View
            key={attendance.date}
            style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}
          >
            <ThemedText>
              {attendance.date} - {attendance.title} {attendance.category} {attendance.instructor}
            </ThemedText>
            <ThemedText>{attendance.title}</ThemedText>
            <ThemedText>{attendance.attendance}</ThemedText>
          </View>
        ))}
    </SafeAreaView>
  );
}
