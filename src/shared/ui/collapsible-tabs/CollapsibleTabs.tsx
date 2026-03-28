import { PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';
import { StyleProp, useWindowDimensions, View, ViewStyle } from 'react-native';
import HeaderMotion, { MotionProgress } from 'react-native-header-motion';
import PagerView, {
  PagerViewOnPageSelectedEvent,
  PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view';
import { SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { TabsRoute, TabsTabBar, TabsTabBarProps } from '@/shared/ui/primitives/Tabs';

import { CollapsibleHeader } from './CollapsibleHeader';
import { CollapsibleLegendList, CollapsibleLegendListProps } from './CollapsibleLegendList';
import {
  CollapsibleProgressContext,
  CollapsibleRoute,
  CollapsibleSceneContext,
  CollapsibleTabsContext,
} from './CollapsibleTabsContext';
import { CollapsibleScrollView } from './createCollapsibleScrollable';
import { useCollapsibleTabs } from './useCollapsibleTabs';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  scene: {
    flex: 1,
  },
});

type ContainerProps<T extends TabsRoute> = {
  index: number;
  onIndexChange: (index: number) => void;
  onRefresh?: () => void;
  pullDistance: SharedValue<number>;
  refreshing?: boolean;
  renderHeader: (props: { progress: MotionProgress['progress'] }) => ReactNode;
  renderTabBar?: (props: TabsTabBarProps<T>) => ReactNode;
  routes: T[];
  style?: StyleProp<ViewStyle>;
};

function ContainerContent<T extends TabsRoute>({
  children,
  headerController,
  index,
  onIndexChange,
  onRefresh,
  pullDistance,
  refreshing = false,
  renderHeader,
  renderTabBar,
  routes,
  style,
}: PropsWithChildren<ContainerProps<T>> & {
  headerController: ReturnType<typeof useCollapsibleTabs>;
}) {
  const { width } = useWindowDimensions();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const { onPageSelected, setPagerRef } = headerController;

  const navigationState = useMemo(() => ({ index, routes }), [index, routes]);

  const contextValue = useMemo(
    () => ({
      activeIndex: index,
      headerHeight,
      isSwiping,
      onRefresh,
      pullDistance,
      refreshing,
      routes: routes as CollapsibleRoute[],
      setIndex: onIndexChange,
    }),
    [headerHeight, index, isSwiping, onIndexChange, onRefresh, pullDistance, refreshing, routes],
  );

  const jumpTo = useCallback(
    (key: string) => {
      const nextIndex = routes.findIndex((route) => route.key === key);
      if (nextIndex >= 0 && nextIndex !== index) {
        onIndexChange(nextIndex);
      }
    },
    [routes, index, onIndexChange],
  );

  const sceneRendererProps = {
    jumpTo,
    layout: { height: 0, width },
    navigationState,
    position: undefined as never,
  } as TabsTabBarProps<T>;

  const tabBar = renderTabBar?.(sceneRendererProps) ?? <TabsTabBar {...sceneRendererProps} />;

  return (
    <CollapsibleTabsContext.Provider value={contextValue}>
      <View style={[styles.container, style]}>
        <HeaderMotion.Header>
          {(motion) => (
            <CollapsibleProgressContext.Provider value={motion.progress}>
              <CollapsibleHeader
                {...motion}
                onMeasuredHeight={setHeaderHeight}
                renderHeader={renderHeader}
                renderTabBar={tabBar}
              />
            </CollapsibleProgressContext.Provider>
          )}
        </HeaderMotion.Header>
        <PagerView
          initialPage={index}
          onPageScrollStateChanged={(event: PageScrollStateChangedNativeEvent) => {
            setIsSwiping(event.nativeEvent.pageScrollState !== 'idle');
          }}
          onPageSelected={(event: PagerViewOnPageSelectedEvent) =>
            onPageSelected(event.nativeEvent.position)
          }
          ref={setPagerRef}
          style={styles.pager}
        >
          {children}
        </PagerView>
      </View>
    </CollapsibleTabsContext.Provider>
  );
}

function ContainerInner<T extends TabsRoute>(props: PropsWithChildren<ContainerProps<T>>) {
  const headerController = useCollapsibleTabs({
    index: props.index,
    onIndexChange: props.onIndexChange,
    routes: props.routes,
  });

  return (
    <HeaderMotion activeScrollId={headerController.activeScrollId.sv}>
      <ContainerContent {...props} headerController={headerController} />
    </HeaderMotion>
  );
}

type SceneProps = {
  routeKey: string;
};

function Scene({ children, routeKey }: PropsWithChildren<SceneProps>) {
  return (
    <CollapsibleSceneContext.Provider value={routeKey}>
      <View key={routeKey} style={styles.scene}>
        {children}
      </View>
    </CollapsibleSceneContext.Provider>
  );
}

function TabBar<T extends TabsRoute>(props: TabsTabBarProps<T>) {
  return <TabsTabBar {...props} />;
}

export const CollapsibleTabs = {
  Container: ContainerInner,
  LegendList: CollapsibleLegendList,
  Scene,
  ScrollView: CollapsibleScrollView,
  TabBar,
} as const;

export type { CollapsibleLegendListProps };
