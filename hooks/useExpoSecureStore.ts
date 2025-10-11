import * as SecureStore from 'expo-secure-store';
import { SetStateAction, useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

type Props<T> = {
  defaultValue: T;
  key: string;
};
type ToObject<T> = T extends Record<string, unknown> | unknown[] ? T : never;
type StorageInsertable<T> = T extends boolean | number | string ? T : ToObject<T>;

// Handle storage change events
const listeners = new Set<() => void>();
const emitListeners = () => {
  for (const l of listeners) {
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
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
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
      emitListeners();
    },
    [getSnapshot, key],
  );

  useEffect(() => {
    (async () => {
      const data = await SecureStore.getItemAsync(key);
      if (data !== cache.current.data) {
        try {
          cache.current.parsed = data != null ? JSON.parse(data) : defaultValue;
        } catch {
          cache.current.parsed = defaultValue;
        }
        cache.current.data = data;
        emitListeners();
      }
    })();
  }, [key, defaultValue]);

  return [storageState, setStorageState] as const;
};
