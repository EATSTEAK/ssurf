import { createContext, useContext } from 'react';
import { SharedValue } from 'react-native-reanimated';

export type CollapsibleRoute = {
  key: string;
  title: string;
};

export type CollapsibleTabsContextValue = {
  activeIndex: number;
  headerHeight: number;
  isSwiping: boolean;
  onRefresh?: () => void;
  pullDistance: SharedValue<number>;
  refreshing: boolean;
  routes: CollapsibleRoute[];
  setIndex: (index: number) => void;
};

export const CollapsibleTabsContext = createContext<CollapsibleTabsContextValue | null>(null);
export const CollapsibleSceneContext = createContext<null | string>(null);
export const CollapsibleProgressContext = createContext<null | SharedValue<number>>(null);

export function useCollapsibleTabsContext() {
  const context = useContext(CollapsibleTabsContext);

  if (!context) {
    throw new Error('CollapsibleTabs components must be used within CollapsibleTabs.Container');
  }

  return context;
}

export function useCollapsibleSceneKey(scrollId?: string) {
  const routeKey = useContext(CollapsibleSceneContext);

  if (scrollId) {
    return scrollId;
  }

  if (!routeKey) {
    throw new Error('A scrollId is required outside CollapsibleTabs.Scene');
  }

  return routeKey;
}

export function useCollapsibleProgress() {
  const progress = useContext(CollapsibleProgressContext);

  if (!progress) {
    throw new Error('Collapsible progress is unavailable outside CollapsibleTabs.Container');
  }

  return progress;
}
