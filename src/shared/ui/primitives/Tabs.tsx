import { ReactNode, useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import {
  NavigationState,
  Route,
  SceneRendererProps,
  TabBar,
  TabBarItemProps,
} from 'react-native-tab-view';
import { StyleSheet } from 'react-native-unistyles';

import { propagateState } from '@/shared/lib/propagateState';

import { ThemedText } from './ThemedText';

export const DEFAULT_TAB_VIEW_HEIGHT = 1000;
const DEFAULT_TAB_BAR_HEIGHT = 40;

const styles = StyleSheet.create((theme) => ({
  listContainer: {
    backgroundColor: theme.colors.surface,
    paddingBottom: theme.gap(1),
  },
  listContent: {
    paddingHorizontal: theme.gap(3),
  },
  listGap: {
    gap: theme.gap(1),
  },
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  tab: {
    width: 'auto',
  },
  pressable: {
    backgroundColor: 'transparent',
  },
  triggerContainer: {
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    borderRadius: theme.cornerRadius.md,
  },
  trigger: (isActive: boolean, pressed: boolean) => ({
    backgroundColor: isActive
      ? pressed
        ? theme.colors.primaryContainer
        : theme.colors.primary
      : pressed
        ? theme.colors.surfaceDimmer
        : theme.colors.surfaceDim,
  }),
  triggerDisabled: {
    opacity: 0.5,
  },
}));

export type TabsTriggerState = {
  isActive: boolean;
  pressed: boolean;
};

export type TabsTriggerStyle =
  | ((state: TabsTriggerState) => StyleProp<ViewStyle>)
  | StyleProp<ViewStyle>;

export interface TabsRoute extends Route {
  accessibilityLabel?: string;
  accessible?: boolean;
  disabled?: boolean;
  onLongPress?: () => void;
  renderLabel?: (state: { isActive: boolean }) => ReactNode;
  testID?: string;
  title: string;
  triggerStyle?: TabsTriggerStyle;
}

export interface TabsTabBarProps<T extends TabsRoute> extends SceneRendererProps {
  listStyle?: StyleProp<ViewStyle>;
  navigationState: NavigationState<T>;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export function TabsTabBar<T extends TabsRoute>({
  listStyle,
  navigationState,
  onLayout,
  ...sceneRendererProps
}: TabsTabBarProps<T>) {
  return (
    <View onLayout={onLayout} style={[styles.listContainer, listStyle]}>
      <TabBar<T>
        bounces={false}
        contentContainerStyle={styles.listContent}
        gap={styles.listGap.gap}
        navigationState={navigationState}
        renderIndicator={() => null}
        renderTabBarItem={(
          props: TabBarItemProps<T> & {
            key: string;
          },
        ) => {
          const isActive =
            props.navigationState.routes[props.navigationState.index]?.key === props.route.key;

          return (
            <Pressable
              accessibilityLabel={props.route.accessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={{ disabled: props.route.disabled, selected: isActive }}
              accessible={props.route.accessible}
              disabled={props.route.disabled}
              key={props.key}
              onLayout={props.onLayout}
              onLongPress={props.route.onLongPress ?? props.onLongPress}
              onPress={props.onPress}
              style={styles.pressable}
              testID={props.route.testID}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.triggerContainer,
                    props.style,
                    styles.trigger(isActive, pressed),
                    props.route.disabled && styles.triggerDisabled,
                    propagateState<TabsTriggerState, StyleProp<ViewStyle>>(
                      { isActive, pressed },
                      props.route.triggerStyle,
                    ),
                  ]}
                >
                  {props.route.renderLabel?.({ isActive }) ?? (
                    <ThemedText color={isActive ? 'fgPrimary' : 'fgSurface'} typography="labelMd">
                      {props.route.title}
                    </ThemedText>
                  )}
                </View>
              )}
            </Pressable>
          );
        }}
        scrollEnabled={navigationState.routes.length > 1}
        style={styles.tabBar}
        tabStyle={styles.tab}
        {...sceneRendererProps}
      />
    </View>
  );
}

export function useAutoHeightTabView<T extends Route>(
  navigationState: NavigationState<T>,
  initialSceneHeight = DEFAULT_TAB_VIEW_HEIGHT,
) {
  const activeRouteKey = navigationState.routes[navigationState.index]?.key;
  const [sceneHeights, setSceneHeights] = useState<Record<string, number>>({});
  const [tabBarHeight, setTabBarHeight] = useState(DEFAULT_TAB_BAR_HEIGHT);
  const [fallbackSceneHeight, setFallbackSceneHeight] = useState(initialSceneHeight);

  const handleSceneLayout = useCallback(
    (key: string) => (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;

      if (height <= 0) {
        return;
      }

      setSceneHeights((prevHeights) =>
        prevHeights[key] === height ? prevHeights : { ...prevHeights, [key]: height },
      );

      if (key === activeRouteKey) {
        setFallbackSceneHeight((prevHeight) => (prevHeight === height ? prevHeight : height));
      }
    },
    [activeRouteKey],
  );

  const handleTabBarLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;

    setTabBarHeight((prevHeight) => (prevHeight === height ? prevHeight : height));
  }, []);

  const currentSceneHeight =
    (activeRouteKey ? sceneHeights[activeRouteKey] : undefined) ?? fallbackSceneHeight;

  return {
    handleSceneLayout,
    handleTabBarLayout,
    tabViewHeight: currentSceneHeight + tabBarHeight,
  };
}
