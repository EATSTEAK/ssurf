import { Image } from 'expo-image';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import { FeedNoticeListItem } from '@/entities/feed/model';
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

export function renderFeedNoticeEmptyState(variant: 'empty' | 'noSource' = 'noSource') {
  return (
    <View style={styles.errorView}>
      <Image contentFit="contain" source={emptyImage} style={{ width: 150, height: 150 }} />
      <ThemedText typography="headingLg">
        {variant === 'noSource' ? '선택된 소스가 없어요' : '표시할 항목이 없어요'}
      </ThemedText>
      {variant === 'noSource' ? (
        <ThemedText color="fgSecondary" typography="bodyLg">
          우측 상단 설정 버튼을 눌러 소스를 선택해주세요
        </ThemedText>
      ) : null}
    </View>
  );
}

export function renderFeedNoticeErrorState(error: Error) {
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

export type FeedNoticeContentProps = {
  isLast: boolean;
  item: FeedNoticeListItem;
  onPressItem: (item: FeedNoticeListItem) => void;
};

export function FeedNoticeContent({ isLast, item, onPressItem }: FeedNoticeContentProps) {
  return <FeedNoticeItem isLast={isLast} item={item} onPress={onPressItem} />;
}
