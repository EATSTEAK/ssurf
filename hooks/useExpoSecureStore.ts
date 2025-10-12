import * as SecureStore from 'expo-secure-store';
import { SetStateAction, useCallback, useRef, useSyncExternalStore } from 'react';
import { useAsyncEffect } from 'react-simplikit';

type Props<T> = {
  defaultValue: T;
  key: string;
};
type ToObject<T> = T extends Record<string, unknown> | unknown[] ? T : never;
/* 
  NOTE: expo-secure-store API의 fallback return 타입이 null이므로, null을 허용하지 않아요.
*/
type StorageInsertable<T> = T extends boolean | number | string ? T : ToObject<T>;

// Handle storage change events
const listeners = new Map<string, Set<() => void>>();
const emitListeners = (key: string) => {
  for (const l of listeners.get(key) ?? []) {
    l();
  }
};

export const useExpoSecureStore = <T>({ defaultValue, key }: Props<StorageInsertable<T>>) => {
  const cache = useRef<{
    data: null | string;
    parsed: StorageInsertable<T>;
  }>({
    data: null,
    parsed: defaultValue,
  });

  const getSnapshot = useCallback(() => cache.current.parsed, []);

  const storageState = useSyncExternalStore<StorageInsertable<T>>(
    (onStoreChange) => {
      if (!listeners.has(key)) {
        listeners.set(key, new Set([onStoreChange]));
      } else {
        listeners.get(key)?.add(onStoreChange);
      }
      return () => {
        listeners.get(key)?.delete(onStoreChange);
      };
    },
    getSnapshot,
    () => defaultValue,
  );

  const setStorageState = useCallback(
    async (value: SetStateAction<StorageInsertable<T>>) => {
      const nextValue = typeof value === 'function' ? value(getSnapshot()) : value;

      if (nextValue == null) {
        await SecureStore.deleteItemAsync(key);
      } else {
        const stringified = JSON.stringify(nextValue);
        await SecureStore.setItemAsync(key, stringified);
        cache.current.data = stringified;
        cache.current.parsed = nextValue;
      }
      emitListeners(key);
    },
    [getSnapshot, key],
  );

  useAsyncEffect(async () => {
    const data = await SecureStore.getItemAsync(key);
    if (data !== cache.current.data) {
      try {
        cache.current.parsed = data != null ? JSON.parse(data) : defaultValue;
      } catch {
        cache.current.parsed = defaultValue;
      }
      cache.current.data = data;
      emitListeners(key);
    }
  }, [key, defaultValue]);

  return [storageState, setStorageState] as const;
};
