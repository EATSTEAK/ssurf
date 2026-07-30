import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock('expo-secure-store', () => ({
  deleteItemAsync: vi.fn(async (key: string) => {
    storage.delete(key);
  }),
  getItemAsync: vi.fn(async (key: string) => storage.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    storage.set(key, value);
  }),
}));

import {
  deleteCanvasAccessToken,
  getCanvasAccessToken,
  saveCanvasAccessToken,
} from './credentials';

describe('Canvas access token storage', () => {
  beforeEach(() => storage.clear());

  it('stores tokens separately for each student ID', async () => {
    await saveCanvasAccessToken('20260001', 'first-token');
    await saveCanvasAccessToken('20260002', 'second-token');

    await expect(getCanvasAccessToken('20260001')).resolves.toBe('first-token');
    await expect(getCanvasAccessToken('20260002')).resolves.toBe('second-token');

    await deleteCanvasAccessToken('20260001');
    await expect(getCanvasAccessToken('20260001')).resolves.toBeNull();
    await expect(getCanvasAccessToken('20260002')).resolves.toBe('second-token');
  });

  it('migrates the previous global token to the current student', async () => {
    storage.set('canvas-access-token', 'legacy-token');

    await expect(getCanvasAccessToken('20260001')).resolves.toBe('legacy-token');
    expect(storage.get('canvas-access-token-20260001')).toBe('legacy-token');
    expect(storage.has('canvas-access-token')).toBe(false);
  });
});
