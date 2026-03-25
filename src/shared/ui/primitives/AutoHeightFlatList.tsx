import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  FlatListProps,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const DEFAULT_CONTAINER_HEIGHT = 1000;

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
  const firstKey = data.length > 0 ? keyExtractor(data[0]) : null;
  const activeKey = selectedKey ?? firstKey;
  const [currentHeight, setCurrentHeight] = useState<number>(firstKey ? DEFAULT_CONTAINER_HEIGHT : 0);
  const flatListRef = useRef<FlatList>(null);
  const pageHeights = useRef<Map<string, number>>(new Map());
  const screenWidth = Dimensions.get('window').width;
  const isScrollingProgrammatically = useRef(false);
  const programmaticScrollFallbackRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const currentKeyRef = useRef<null | string>(activeKey);
  const pendingScrollTargetKeyRef = useRef<null | string>(null);

  const updateCurrentHeight = useCallback((key: null | string) => {
    if (!key) {
      setCurrentHeight(0);
      return;
    }

    const height = pageHeights.current.get(key);
    if (height === undefined) {
      return;
    }

    setCurrentHeight((prevHeight: number) => (prevHeight === height ? prevHeight : height));
  }, []);

  const clearProgrammaticScrollFallback = useCallback(() => {
    if (!programmaticScrollFallbackRef.current) {
      return;
    }

    clearTimeout(programmaticScrollFallbackRef.current);
    programmaticScrollFallbackRef.current = null;
  }, []);

  const handlePageChangeInternal = useCallback(
    (key: string) => {
      if (currentKeyRef.current === key) {
        updateCurrentHeight(key);
        return;
      }

      currentKeyRef.current = key;
      updateCurrentHeight(key);
      onPageChange?.(key);
    },
    [onPageChange, updateCurrentHeight],
  );

  const finishProgrammaticScroll = useCallback(
    (key?: string) => {
      clearProgrammaticScrollFallback();
      isScrollingProgrammatically.current = false;

      const resolvedKey = key ?? pendingScrollTargetKeyRef.current;
      pendingScrollTargetKeyRef.current = null;

      if (!resolvedKey) {
        return;
      }

      handlePageChangeInternal(resolvedKey);
    },
    [clearProgrammaticScrollFallback, handlePageChangeInternal],
  );

  const handlePageLayout = useCallback(
    (key: string) => (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      pageHeights.current.set(key, height);

      const currentActiveKey = currentKeyRef.current ?? activeKey;
      if (key === currentActiveKey) {
        setCurrentHeight((prevHeight: number) => (prevHeight === height ? prevHeight : height));
      }
    },
    [activeKey],
  );

  useEffect(() => {
    if (selectedKey) {
      return;
    }

    currentKeyRef.current = activeKey;
  }, [activeKey, selectedKey]);

  useEffect(() => {
    if (!selectedKey || !flatListRef.current) {
      return;
    }

    const index = data.findIndex((item) => keyExtractor(item) === selectedKey);
    if (index === -1 || currentKeyRef.current === selectedKey) {
      pendingScrollTargetKeyRef.current = null;
      return;
    }

    pendingScrollTargetKeyRef.current = selectedKey;
    isScrollingProgrammatically.current = true;
    flatListRef.current.scrollToIndex({ animated: true, index });

    clearProgrammaticScrollFallback();
    programmaticScrollFallbackRef.current = setTimeout(() => {
      finishProgrammaticScroll(selectedKey);
    }, 700);
  }, [activeKey, clearProgrammaticScrollFallback, data, finishProgrammaticScroll, keyExtractor, selectedKey]);

  useEffect(
    () => () => {
      clearProgrammaticScrollFallback();
    },
    [clearProgrammaticScrollFallback],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);

      if (index < 0 || index >= data.length) {
        if (isScrollingProgrammatically.current) {
          finishProgrammaticScroll();
        }
        return;
      }

      const item = data[index];
      const key = keyExtractor(item);

      if (isScrollingProgrammatically.current) {
        finishProgrammaticScroll(key);
        return;
      }

      handlePageChangeInternal(key);
    },
    [data, finishProgrammaticScroll, handlePageChangeInternal, keyExtractor, screenWidth],
  );

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
        pagingEnabled
        ref={flatListRef}
        renderItem={renderFlatListItem}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
