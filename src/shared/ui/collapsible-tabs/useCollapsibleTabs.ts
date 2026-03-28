import { useCallback, useEffect, useRef } from 'react';
import { useActiveScrollId } from 'react-native-header-motion';
import PagerView from 'react-native-pager-view';

import { CollapsibleRoute } from './CollapsibleTabsContext';

export function useCollapsibleTabs({
  index,
  onIndexChange,
  routes,
}: {
  index: number;
  onIndexChange: (index: number) => void;
  routes: CollapsibleRoute[];
}) {
  const pagerRef = useRef<null | PagerView>(null);
  const setPagerRef = useCallback((instance: null | PagerView) => {
    pagerRef.current = instance;
  }, []);
  const [activeScrollId, setActiveScrollId] = useActiveScrollId(
    routes[index]?.key ?? routes[0]?.key ?? '',
  );

  useEffect(() => {
    const route = routes[index];

    if (!route) {
      return;
    }

    pagerRef.current?.setPageWithoutAnimation(index);
    setActiveScrollId(route.key);
  }, [index, routes, setActiveScrollId]);

  return {
    activeScrollId,
    onPageSelected: (nextIndex: number) => {
      const route = routes[nextIndex];
      if (!route) {
        return;
      }

      setActiveScrollId(route.key);

      if (nextIndex !== index) {
        onIndexChange(nextIndex);
      }
    },
    pagerRef,
    setPagerRef,
  };
}
