import { LegendListProps } from '@legendapp/list';
import { AnimatedLegendList, AnimatedLegendListProps } from '@legendapp/list/reanimated';
import { StyleProp, ViewStyle } from 'react-native';
import HeaderMotion from 'react-native-header-motion';
import Reanimated, { AnimatedRef } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useCollapsibleSceneKey, useCollapsibleTabsContext } from './CollapsibleTabsContext';

const styles = StyleSheet.create((theme) => ({
  list: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDim,
  },
}));

export type CollapsibleLegendListProps<T> = LegendListProps<T> & {
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollId?: string;
  style?: StyleProp<ViewStyle>;
};

export function CollapsibleLegendList<T>({
  contentContainerStyle,
  scrollId,
  style,
  ...props
}: CollapsibleLegendListProps<T>) {
  const resolvedScrollId = useCollapsibleSceneKey(scrollId);
  const { isSwiping } = useCollapsibleTabsContext();

  return (
    <HeaderMotion.ScrollManager scrollId={resolvedScrollId}>
      {(scrollableProps, { minHeightContentContainerStyle, originalHeaderHeight }) => {
        const attachScrollRef = (
          instance: null | React.ComponentRef<typeof Reanimated.ScrollView>,
        ) => {
          (scrollableProps.ref as AnimatedRef<Reanimated.ScrollView>)(instance as never);
        };

        return (
          <AnimatedLegendList
            {...({
              ...(props as LegendListProps<T>),
              contentContainerStyle: [
                minHeightContentContainerStyle,
                { paddingTop: originalHeaderHeight },
                contentContainerStyle,
              ],
              onScroll: scrollableProps.onScroll,
              refreshControl: scrollableProps.refreshControl,
              refScrollView: attachScrollRef,
              scrollEventThrottle: scrollableProps.scrollEventThrottle,
              showsVerticalScrollIndicator: !isSwiping,
              style: [styles.list, style],
            } as AnimatedLegendListProps<T>)}
          />
        );
      }}
    </HeaderMotion.ScrollManager>
  );
}
