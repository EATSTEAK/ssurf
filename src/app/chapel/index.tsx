import { SemesterType } from '@rusaint/react-native';
import { Button, Text, View } from 'react-native';

import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
import { useChapelAttendances, useGeneralChapelInformation } from '@/hooks/chapel/chapel';

export default function Index() {
  const { logout } = useRusaintSession();
  const { data: general } = useGeneralChapelInformation(2025, SemesterType.Two);
  const { data: attendances } = useChapelAttendances(2025, SemesterType.Two);

  if (!general) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 10,
        padding: 20,
      }}
    >
      <Button onPress={logout} title="로그아웃" />
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
    </View>
  );
}
