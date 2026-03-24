import { Image } from 'expo-image';
import { FlatList, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import { FeedNoticeEntity } from '@/entities/feed/model';
import { CardView } from '@/shared/ui/containers/CardView';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

import { FeedNoticeItem } from './FeedNoticeItem';

const styles = StyleSheet.create(() => ({
  errorView: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 16,
    marginBottom: 96,
  },
}));

type FeedNoticeContentProps = {
  error?: Error | null;
  hasSources: boolean;
  isSyncing: boolean;
  items: FeedNoticeEntity[];
  onPressItem: (item: FeedNoticeEntity) => void;
};

export function FeedNoticeContent({
  items,
  isSyncing,
  error,
  hasSources,
  onPressItem,
}: FeedNoticeContentProps) {
  if (!hasSources) {
    return (
      <View style={styles.errorView}>
        <Image contentFit="contain" source={emptyImage} style={{ width: 150, height: 150 }} />
        <ThemedText typography="headingLg">선택된 소스가 없어요</ThemedText>
        <ThemedText color="fgSecondary" typography="bodyLg">
          우측 상단 설정 버튼을 눌러 소스를 선택해주세요
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorView}>
        <Image contentFit="contain" source={errorImage} style={{ width: 150, height: 150 }} />
        <ThemedText color="error" typography="headingLg">
          정보를 가져오는 중 오류가 발생했어요
        </ThemedText>
        <ThemedText color="fgSecondary" typography="bodyLg">
          아래로 당겨 다시 시도해보세요
        </ThemedText>
        <ThemedText color="fgSecondary" typography="bodySm">
          {error.message}
        </ThemedText>
      </View>
    );
  }

  if (items.length === 0 && !isSyncing) {
    return (
      <View style={styles.errorView}>
        <Image contentFit="contain" source={emptyImage} style={{ width: 150, height: 150 }} />
        <ThemedText typography="headingLg">표시할 항목이 없어요</ThemedText>
      </View>
    );
  }

  return (
    <CardView>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.slug}-${item.id}`}
        renderItem={({ index, item }) => (
          <FeedNoticeItem isLast={index === items.length - 1} item={item} onPress={onPressItem} />
        )}
        scrollEnabled={false}
      />
    </CardView>
  );
}
