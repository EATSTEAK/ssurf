import * as TabsPrimitive from '@rn-primitives/tabs';
import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from './ThemedText';

const styles = StyleSheet.create((theme) => ({
  listContainer: {
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flexGrow: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(3),
  },
  trigger: (isActive: boolean) => ({
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    borderRadius: theme.cornerRadius.md,
    backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceDim,
  }),
  content: {
    paddingTop: theme.gap(2),
  },
}));

// Tabs Context for sharing refs
interface TabsContextValue {
  scrollViewRef: React.RefObject<null | ScrollView>;
  setTriggerRef: (key: string, layout: { width: number; x: number }) => void;
}

const TabsContext = createContext<null | TabsContextValue>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs.Root');
  }
  return context;
};

// Root 컴포넌트에 자동 스크롤 기능 추가
function Root({
  children,
  value,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>) {
  const scrollViewRef = useRef<ScrollView>(null);
  const triggerRefsMap = useRef(new Map<string, { width: number; x: number }>());

  const setTriggerRef = (key: string, layout: { width: number; x: number }) => {
    triggerRefsMap.current.set(key, layout);
  };

  useEffect(() => {
    if (value && scrollViewRef.current) {
      const tabInfo = triggerRefsMap.current.get(value);
      if (tabInfo) {
        scrollViewRef.current.scrollTo({
          animated: true,
          x: tabInfo.x - 100, // 좌측 여백 고려
        });
      }
    }
  }, [value]);

  return (
    <TabsPrimitive.Root {...props} value={value}>
      <TabsContext.Provider
        value={{
          scrollViewRef,
          setTriggerRef,
        }}
      >
        {children}
      </TabsContext.Provider>
    </TabsPrimitive.Root>
  );
}

function List({ children, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  const { scrollViewRef } = useTabsContext();

  return (
    <TabsPrimitive.List style={styles.listContainer} {...props} asChild>
      <ScrollView
        contentContainerStyle={styles.list}
        horizontal
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {children}
      </ScrollView>
    </TabsPrimitive.List>
  );
}

// Trigger 컴포넌트
function Trigger({
  children,
  value,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { children?: ReactNode }) {
  const rootContext = TabsPrimitive.useRootContext();
  const { setTriggerRef } = useTabsContext();
  const isActive = rootContext.value === value;

  return (
    <View
      onLayout={(event) => {
        const { width, x } = event.nativeEvent.layout;
        setTriggerRef(value, { width, x });
      }}
    >
      <TabsPrimitive.Trigger {...props} style={[styles.trigger(isActive)]} value={value}>
        {children || (
          <ThemedText color={isActive ? 'fgPrimary' : 'fgSurface'} typography="labelMd">
            {value}
          </ThemedText>
        )}
      </TabsPrimitive.Trigger>
    </View>
  );
}

// Content 컴포넌트
function Content({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content {...props} style={styles.content}>
      {children}
    </TabsPrimitive.Content>
  );
}

export const Tabs = {
  Content,
  List,
  Root,
  Trigger,
};
