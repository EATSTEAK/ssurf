import {
  LegendList,
  type LegendListProps,
  type LegendListRef,
  type OnViewableItemsChanged,
} from '@legendapp/list';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { Ref } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import emptyImage from '@/assets/empty.png';
import errorImage from '@/assets/error.png';
import { CalendarEntity } from '@/entities/calendar/model';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

import { CalendarItem } from './CalendarItem';

const styles = StyleSheet.create((theme) => ({
  list: {
    backgroundColor: theme.colors.surfaceDim,
    flex: 1,
  },
  listEmpty: {
    minHeight: 240,
  },
  monthHeader: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1.5),
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

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };

const getMonthLabel = (item: CalendarEntity) => {
  const timestamp = item.startsAt ?? item.endsAt;
  return timestamp === null ? '날짜 미정' : format(new Date(timestamp), 'yyyy년 M월');
};

type CalendarContentProps = {
  error?: Error | null;
  hasSources: boolean;
  isSyncing: boolean;
  items: CalendarEntity[];
  listContentContainerStyle?: LegendListProps<CalendarEntity>['contentContainerStyle'];
  listRef?: Ref<LegendListRef>;
  onPressItem: (item: CalendarEntity) => void;
  onRefresh?: () => void;
  onScroll?: LegendListProps<CalendarEntity>['onScroll'];
  onScrollBeginDrag?: LegendListProps<CalendarEntity>['onScrollBeginDrag'];
  onViewableItemsChanged?: OnViewableItemsChanged<CalendarEntity>;
  scrollEventThrottle?: number;
};

export function CalendarContent({
  items,
  isSyncing,
  error,
  hasSources,
  listContentContainerStyle,
  listRef,
  onPressItem,
  onRefresh,
  onScroll,
  onScrollBeginDrag,
  onViewableItemsChanged,
  scrollEventThrottle,
}: CalendarContentProps) {
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

  const emptyComponent = error ? (
    <View style={[styles.errorView, styles.listEmpty]}>
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
  ) : items.length === 0 && !isSyncing ? (
    <View style={[styles.errorView, styles.listEmpty]}>
      <Image contentFit="contain" source={emptyImage} style={{ width: 150, height: 150 }} />
      <ThemedText typography="headingLg">표시할 항목이 없어요</ThemedText>
    </View>
  ) : null;

  return (
    <LegendList
      contentContainerStyle={listContentContainerStyle}
      data={error ? [] : items}
      keyExtractor={(item) => `${item.slug}-${item.id}`}
      ListEmptyComponent={emptyComponent}
      maintainVisibleContentPosition
      onRefresh={onRefresh}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onViewableItemsChanged={onViewableItemsChanged}
      recycleItems
      ref={listRef}
      refreshing={isSyncing}
      renderItem={({ index, item }) => {
        const monthLabel = getMonthLabel(item);
        const isFirstInMonth = index === 0 || getMonthLabel(items[index - 1]) !== monthLabel;
        const isLastInMonth =
          index === items.length - 1 || getMonthLabel(items[index + 1]) !== monthLabel;

        return (
          <>
            {isFirstInMonth ? (
              <View style={styles.monthHeader}>
                <ThemedText color="fgSecondary" typography="headingMd">
                  {monthLabel}
                </ThemedText>
              </View>
            ) : null}
            <CalendarItem isLast={isLastInMonth} item={item} onPress={onPressItem} />
          </>
        );
      }}
      scrollEventThrottle={scrollEventThrottle}
      style={styles.list}
      viewabilityConfig={VIEWABILITY_CONFIG}
    />
  );
}
