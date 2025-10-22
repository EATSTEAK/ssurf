import { SemesterType } from '@rusaint/react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/primitives/Button';
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
      <Text style={{ fontSize: 36, fontWeight: 'bold' }}>채플 정보</Text>
      <Text style={{ fontSize: 16, color: '#666' }}>
        {general.year}-{general.semester}학기
      </Text>
      <Text>{general.division}</Text>
      <Text>
        {general.floor} / {general.seat}
      </Text>
      <Text>{general.time}</Text>
      <Text>{general.absenceTime}</Text>
      {attendances &&
        attendances.map((attendance) => (
          <View
            key={attendance.date}
            style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}
          >
            <Text>
              {attendance.date} - {attendance.title} {attendance.category} {attendance.instructor}
            </Text>
            <Text>{attendance.title}</Text>
            <Text>{attendance.attendance}</Text>
          </View>
        ))}
    </SafeAreaView>
  );
}
