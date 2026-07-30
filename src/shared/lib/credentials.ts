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
const LEGACY_CANVAS_ACCESS_TOKEN_KEY = 'canvas-access-token';
export const EMPTY_USER_INFO: StoredUserInfo = { id: null, password: null };

const getCanvasAccessTokenKey = (studentId: string) => {
  const normalizedStudentId = studentId.trim();
  if (!/^[A-Za-z0-9._-]+$/.test(normalizedStudentId)) {
    throw new Error('올바른 학번이 필요해요.');
  }
  return `${LEGACY_CANVAS_ACCESS_TOKEN_KEY}-${normalizedStudentId}`;
};

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

export const getCanvasAccessToken = async (studentId: string) => {
  const key = getCanvasAccessTokenKey(studentId);
  const token = await SecureStore.getItemAsync(key);
  if (token) {
    return token;
  }

  const legacyToken = await SecureStore.getItemAsync(LEGACY_CANVAS_ACCESS_TOKEN_KEY);
  if (!legacyToken) {
    return null;
  }
  await SecureStore.setItemAsync(key, legacyToken);
  await SecureStore.deleteItemAsync(LEGACY_CANVAS_ACCESS_TOKEN_KEY);
  return legacyToken;
};

export const saveCanvasAccessToken = async (studentId: string, token: string) => {
  await SecureStore.setItemAsync(getCanvasAccessTokenKey(studentId), token);
  await SecureStore.deleteItemAsync(LEGACY_CANVAS_ACCESS_TOKEN_KEY);
};

export const deleteCanvasAccessToken = (studentId: string) =>
  Promise.all([
    SecureStore.deleteItemAsync(getCanvasAccessTokenKey(studentId)),
    SecureStore.deleteItemAsync(LEGACY_CANVAS_ACCESS_TOKEN_KEY),
  ]).then(() => undefined);
