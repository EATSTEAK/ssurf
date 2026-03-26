import {
  Children,
  createContext,
  isValidElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
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

const styles = StyleSheet.create((theme) => ({
  listContainer: {
    backgroundColor: theme.colors.surface,
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
  content: {
    paddingTop: theme.gap(2),
  },
}));

type ExtendedTriggerState = {
  isActive: boolean;
  pressed: boolean;
};

type ExtendedTriggerStyle =
  | ((state: ExtendedTriggerState) => StyleProp<ViewStyle>)
  | StyleProp<ViewStyle>;

interface TabsRootContextValue {
  onValueChange?: (value: string) => void;
  value: string;
}

const TabsRootContext = createContext<null | TabsRootContextValue>(null);

const useTabsRootContext = () => {
  const context = useContext(TabsRootContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs.Root');
  }
  return context;
};

interface TabsRootProps {
  children: ReactNode;
  onValueChange?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  value: string;
}

interface TabsListProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface TabsTriggerProps {
  accessibilityLabel?: string;
  accessible?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  onLongPress?: () => void;
  style?: ExtendedTriggerStyle;
  testID?: string;
  value: string;
}

interface TabsContentProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  value: string;
}

type TabRoute = Route & {
  accessibilityLabel?: string;
  accessible?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  onLongPress?: () => void;
  style?: ExtendedTriggerStyle;
  testID?: string;
};

const extractTriggerRoutes = (children: ReactNode): TabRoute[] => {
  return Children.toArray(children).flatMap((child): TabRoute[] => {
    if (!isValidElement(child)) {
      return [];
    }

    if (child.type === Trigger) {
      const {
        accessibilityLabel,
        accessible,
        children: triggerChildren,
        disabled,
        onLongPress,
        style,
        testID,
        value,
      } = child.props as TabsTriggerProps;

      return [
        {
          accessibilityLabel,
          accessible,
          children: triggerChildren,
          disabled,
          key: value,
          onLongPress,
          style,
          testID,
          title: value,
        },
      ];
    }

    const nestedChildren = (child.props as { children?: ReactNode }).children;
    if (nestedChildren) {
      return extractTriggerRoutes(nestedChildren);
    }

    return [];
  });
};

function Root({ children, onValueChange, style, value }: TabsRootProps) {
  return (
    <TabsRootContext.Provider value={{ onValueChange, value }}>
      {style ? <View style={style}>{children}</View> : children}
    </TabsRootContext.Provider>
  );
}

function List({ children, style }: TabsListProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { onValueChange, value } = useTabsRootContext();
  const [layout, setLayout] = useState({ height: 0, width: windowWidth });
  const routes = useMemo(() => extractTriggerRoutes(children), [children]);
  const selectedIndex = routes.findIndex((route) => route.key === value);
  const safeIndex = selectedIndex === -1 ? 0 : selectedIndex;
  const navigationState = useMemo<NavigationState<TabRoute>>(
    () => ({ index: safeIndex, routes }),
    [routes, safeIndex],
  );
  const [position] = useState(() => new Animated.Value(safeIndex));

  useEffect(() => {
    position.setValue(safeIndex);
  }, [position, safeIndex]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setLayout((prev) => (prev.height === height && prev.width === width ? prev : { height, width }));
  };

  if (routes.length === 0) {
    return <View onLayout={handleLayout} style={[styles.listContainer, style]} />;
  }

  return (
    <View onLayout={handleLayout} style={[styles.listContainer, style]}>
      <TabBar<TabRoute>
        bounces={false}
        contentContainerStyle={styles.listContent}
        gap={styles.listGap.gap}
        jumpTo={(key) => {
          if (key !== value) {
            onValueChange?.(key);
          }
        }}
        layout={layout}
        navigationState={navigationState}
        position={position as unknown as SceneRendererProps['position']}
        renderIndicator={() => null}
        renderTabBarItem={(
          props: TabBarItemProps<TabRoute> & {
            key: string;
          },
        ) => {
          const isActive = props.navigationState.routes[props.navigationState.index]?.key === props.route.key;

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
                    propagateState<ExtendedTriggerState, StyleProp<ViewStyle>>(
                      { isActive, pressed },
                      props.route.style,
                    ),
                  ]}
                >
                  {props.route.children ?? (
                    <ThemedText color={isActive ? 'fgPrimary' : 'fgSurface'} typography="labelMd">
                      {props.route.title}
                    </ThemedText>
                  )}
                </View>
              )}
            </Pressable>
          );
        }}
        scrollEnabled
        style={styles.tabBar}
        tabStyle={styles.tab}
      />
    </View>
  );
}

function Trigger(props: TabsTriggerProps) {
  void props;
  return null;
}

function Content({ children, style, value }: TabsContentProps) {
  const context = useTabsRootContext();

  if (context.value !== value) {
    return null;
  }

  return <View style={[styles.content, style]}>{children}</View>;
}

export const Tabs = {
  Content,
  List,
  Root,
  Trigger,
};
