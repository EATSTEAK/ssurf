import * as TabsPrimitive from '@rn-primitives/tabs';
import { ReactNode } from 'react';
import { ScrollView } from 'react-native';
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

// Root 컴포넌트
const Root = TabsPrimitive.Root;

// List 컴포넌트 (스크롤 가능한 탭 목록)
function List({ children, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List style={styles.listContainer} {...props} asChild>
      <ScrollView
        contentContainerStyle={styles.list}
        horizontal
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
  const isActive = rootContext.value === value;

  return (
    <TabsPrimitive.Trigger {...props} style={[styles.trigger(isActive)]} value={value}>
      {children || (
        <ThemedText color={isActive ? 'fgPrimary' : 'fgSurface'} typography="labelMd">
          {value}
        </ThemedText>
      )}
    </TabsPrimitive.Trigger>
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
