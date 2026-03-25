import { Image } from 'expo-image';
import { ReactElement } from 'react';
import { FlatList, FlatListProps, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import { FeedCalendarEntity } from '@/entities/feed/model';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

import { FeedCalendarItem } from './FeedCalendarItem';

const styles = StyleSheet.create((theme) => ({
  list: {
    backgroundColor: theme.colors.surfaceDim,
  },
  errorView: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 16,
    marginBottom: 96,
  },
}));

type FeedCalendarContentProps = {
  error?: Error | null;
  hasSources: boolean;
  headerComponent?: null | ReactElement;
  isSyncing: boolean;
  items: FeedCalendarEntity[];
  listContentContainerStyle?: FlatListProps<FeedCalendarEntity>['contentContainerStyle'];
  onPressItem: (item: FeedCalendarEntity) => void;
  onRefresh?: () => void;
  onScroll?: FlatListProps<FeedCalendarEntity>['onScroll'];
  scrollEventThrottle?: number;
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<FeedCalendarEntity>);

export function FeedCalendarContent({
  items,
  isSyncing,
  error,
  hasSources,
  headerComponent,
  listContentContainerStyle,
  onPressItem,
  onRefresh,
  onScroll,
  scrollEventThrottle = 16,
}: FeedCalendarContentProps) {
  if (!hasSources) {
    return (
      <>
        {headerComponent}
        <View style={styles.errorView}>
          <Image contentFit="contain" source={emptyImage} style={{ width: 150, height: 150 }} />
          <ThemedText typography="headingLg">선택된 소스가 없어요</ThemedText>
          <ThemedText color="fgSecondary" typography="bodyLg">
            우측 상단 설정 버튼을 눌러 소스를 선택해주세요
          </ThemedText>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        {headerComponent}
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
      </>
    );
  }

  if (items.length === 0 && !isSyncing) {
    return (
      <>
        {headerComponent}
        <View style={styles.errorView}>
          <Image contentFit="contain" source={emptyImage} style={{ width: 150, height: 150 }} />
          <ThemedText typography="headingLg">표시할 항목이 없어요</ThemedText>
        </View>
      </>
    );
  }

  return (
    <AnimatedFlatList
      contentContainerStyle={listContentContainerStyle}
      data={items}
      keyExtractor={(item) => `${item.slug}-${item.id}`}
      ListHeaderComponent={headerComponent}
      onRefresh={onRefresh}
      onScroll={onScroll}
      refreshing={isSyncing}
      renderItem={({ index, item }) => (
        <FeedCalendarItem isLast={index === items.length - 1} item={item} onPress={onPressItem} />
      )}
      scrollEventThrottle={scrollEventThrottle}
      style={styles.list}
    />
  );
}
