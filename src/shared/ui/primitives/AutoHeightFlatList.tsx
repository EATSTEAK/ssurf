import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  FlatListProps,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  ViewToken,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create(() => ({
  container: (height: number) => ({
    height,
    width: '100%',
  }),
  pageContainer: (width: number) => ({
    width,
  }),
}));

interface AutoHeightFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: readonly T[];
  keyExtractor: (item: T) => string;
  onPageChange?: (key: string) => void;
  renderItem: (item: T) => React.ReactElement;
  selectedKey?: string;
}

export function AutoHeightFlatList<T>({
  data,
  keyExtractor,
  onPageChange,
  renderItem,
  selectedKey,
  ...flatListProps
}: AutoHeightFlatListProps<T>) {
  const [currentHeight, setCurrentHeight] = useState(1000);
  const flatListRef = useRef<FlatList>(null);
  const pageHeights = useRef<Map<string, number>>(new Map());
  const screenWidth = Dimensions.get('window').width;
  const isScrollingProgrammatically = useRef(false);
  const currentKeyRef = useRef<null | string>(null);

  // 페이지 높이 측정
  const handlePageLayout = (key: string) => (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    pageHeights.current.set(key, height);

    const firstKey = data.length > 0 ? keyExtractor(data[0]) : null;
    if (key === firstKey) {
      setCurrentHeight(height);
    }
  };

  // selectedKey 변경 시 스크롤
  useEffect(() => {
    if (selectedKey && flatListRef.current) {
      const index = data.findIndex((item) => keyExtractor(item) === selectedKey);
      if (index !== -1) {
        isScrollingProgrammatically.current = true;
        flatListRef.current.scrollToIndex({ animated: true, index });

        // 높이 업데이트
        const height = pageHeights.current.get(selectedKey);
        if (height) {
          setCurrentHeight(height);
        }

        // 애니메이션 완료 후 플래그 초기화
        setTimeout(() => {
          isScrollingProgrammatically.current = false;
        }, 500);
      }
    }
  }, [selectedKey, data, keyExtractor]);

  // 페이지 변경 처리 함수
  const handlePageChangeInternal = useCallback(
    (key: string) => {
      if (currentKeyRef.current === key) {
        return;
      }

      currentKeyRef.current = key;

      // 높이 업데이트
      const height = pageHeights.current.get(key);
      if (height) {
        setCurrentHeight(height);
      }

      // 페이지 변경 콜백
      if (onPageChange) {
        onPageChange(key);
      }
    },
    [onPageChange],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // 프로그래밍 방식 스크롤 중이면 콜백 호출 안 함
      if (isScrollingProgrammatically.current) {
        return;
      }

      if (viewableItems.length > 0 && viewableItems[0].item) {
        const item = viewableItems[0].item as T;
        const key = keyExtractor(item);
        handlePageChangeInternal(key);
      }
    },
    [keyExtractor, handlePageChangeInternal],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrollingProgrammatically.current) {
        return;
      }

      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);

      if (index >= 0 && index < data.length) {
        const item = data[index];
        const key = keyExtractor(item);
        handlePageChangeInternal(key);
      }
    },
    [data, keyExtractor, screenWidth, handlePageChangeInternal],
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    [],
  );

  // FlatList 렌더 아이템
  const renderFlatListItem = ({ item }: { item: T }) => {
    const key = keyExtractor(item);
    return (
      <View style={styles.pageContainer(screenWidth)}>
        <View onLayout={handlePageLayout(key)}>{renderItem(item)}</View>
      </View>
    );
  };

  return (
    <View style={styles.container(currentHeight)}>
      <FlatList
        {...flatListProps}
        data={data}
        getItemLayout={(_, index) => ({
          index,
          length: screenWidth,
          offset: screenWidth * index,
        })}
        horizontal
        keyExtractor={(item) => keyExtractor(item)}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            animated: true,
            offset: screenWidth * info.index,
          });
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        ref={flatListRef}
        renderItem={renderFlatListItem}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}
