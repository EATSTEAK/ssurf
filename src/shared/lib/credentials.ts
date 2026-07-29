import * as SecureStore from 'expo-secure-store';

export type StoredUserInfo = {
  id: null | string;
  password: null | string;
};

export type StoredCredentials = {
  id: string;
  password: string;
};

export const USER_INFO_KEY = 'user-info';
export const CANVAS_ACCESS_TOKEN_KEY = 'canvas-access-token';
export const EMPTY_USER_INFO: StoredUserInfo = { id: null, password: null };

const isNullableString = (value: unknown): value is null | string =>
  value === null || typeof value === 'string';

export const getStoredUserInfo = async (): Promise<StoredUserInfo> => {
  const raw = await SecureStore.getItemAsync(USER_INFO_KEY);
  if (!raw) {
    return EMPTY_USER_INFO;
  }

  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'password' in value &&
      isNullableString(value.id) &&
      isNullableString(value.password)
    ) {
      return { id: value.id, password: value.password };
    }
  } catch {
    // Ignore invalid persisted credentials and fall back to the logged-out state.
  }

  return EMPTY_USER_INFO;
};

export const getStoredCredentials = async (): Promise<null | StoredCredentials> => {
  const value = await getStoredUserInfo();
  return value.id && value.password ? { id: value.id, password: value.password } : null;
};

export const getCanvasAccessToken = () => SecureStore.getItemAsync(CANVAS_ACCESS_TOKEN_KEY);

export const saveCanvasAccessToken = (token: string) =>
  SecureStore.setItemAsync(CANVAS_ACCESS_TOKEN_KEY, token);

export const deleteCanvasAccessToken = () => SecureStore.deleteItemAsync(CANVAS_ACCESS_TOKEN_KEY);
