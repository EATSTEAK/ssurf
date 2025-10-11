import { SemesterType } from '@rusaint/react-native';
import { Text, View } from 'react-native';

import { useChapelInformation } from '@/hooks/chapel/chapel';

export default function Index() {
  const result = useChapelInformation(2025, SemesterType.Two);

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
