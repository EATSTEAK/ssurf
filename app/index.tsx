import { SemesterType } from '@rusaint/react-native';
import { Text, View } from 'react-native';

import { useGeneralChapelInformation } from '@/hooks/chapel/chapel';

export default function Index() {
  const result = useGeneralChapelInformation(2025, SemesterType.Two);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>{JSON.stringify(result)}</Text>
    </View>
  );
}
