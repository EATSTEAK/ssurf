import { LectureCategoryBuilder, SemesterType } from '@rusaint/react-native';
import { Text, View } from 'react-native';

import { useFindLectures } from '@/hooks/use-find-lectures';

const category = new LectureCategoryBuilder().major('IT대학', '글로벌미디어학부', undefined);

export default function Index() {
  const result = useFindLectures(2025, SemesterType.One, category);

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
