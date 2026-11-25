import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteToken: vi.fn(),
  reset: vi.fn(),
  setUserInfo: vi.fn(),
  setters: [] as ReturnType<typeof vi.fn>[],
  effect: null as (() => Promise<void>) | null,
  withPassword: vi.fn(),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useCallback: (callback: unknown) => callback,
  useRef: () => ({ current: null }),
  useState: (initial: unknown) => {
    const setter = vi.fn();
    mocks.setters.push(setter);
    return [initial, setter];
  },
}));
vi.mock('react-simplikit', () => ({
  useAsyncEffect: (effect: () => Promise<void>) => {
    mocks.effect = effect;
  },
}));
vi.mock('@rusaint/react-native', () => ({
  USaintSessionBuilder: class {
    withPassword = mocks.withPassword;
  },
}));
vi.mock('expo-router', () => ({ useRouter: () => ({ navigate: vi.fn() }) }));
vi.mock('@/shared/lib/applications', () => ({
  applications: { reset: mocks.reset, start: vi.fn() },
}));
vi.mock('@/shared/lib/credentials', () => ({
  deleteCanvasAccessToken: mocks.deleteToken,
  EMPTY_USER_INFO: { id: null, password: null },
  USER_INFO_KEY: 'user-info',
}));
vi.mock('@/shared/lib/onboardingCompletion', () => ({
  completeOnboardingFor: vi.fn(),
  EMPTY_ONBOARDING_COMPLETIONS: {},
  hasCompletedOnboarding: () => true,
  ONBOARDING_COMPLETIONS_KEY: 'onboarding',
  resetOnboardingFor: vi.fn(),
}));
vi.mock('@/shared/lib/useExpoSecureStore', () => ({
  useExpoSecureStore: ({ key }: { key: string }) =>
    key === 'user-info'
      ? [{ id: '20260001', password: 'password' }, mocks.setUserInfo, false]
      : [{}, vi.fn(), false],
}));

import { RusaintSessionProvider } from './RusaintSessionProvider';

const renderProvider = () => RusaintSessionProvider({ children: null }).props.value;

describe('session logout recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setters = [];
    mocks.deleteToken.mockResolvedValue(undefined);
    mocks.setUserInfo.mockResolvedValue(undefined);
    mocks.withPassword.mockRejectedValue(new Error('session failed'));
  });

  it('logs out after startup login fails, clearing the token before credentials and clearing the error', async () => {
    const context = renderProvider();
    await mocks.effect?.();
    expect(mocks.setters[2]).toHaveBeenCalledWith(expect.any(Error));
    await context.logout();
    expect(mocks.deleteToken).toHaveBeenCalledWith('20260001');
    expect(mocks.deleteToken.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.setUserInfo.mock.invocationCallOrder[0],
    );
    expect(mocks.setUserInfo).toHaveBeenCalledWith({ id: null, password: null });
    expect(mocks.reset).toHaveBeenCalledOnce();
    expect(mocks.setters[0]).toHaveBeenCalledWith(null);
    expect(mocks.setters[2]).toHaveBeenLastCalledWith(null);
  });

  it('keeps credentials and runtime intact when token deletion fails, allowing retry', async () => {
    const context = renderProvider();
    mocks.deleteToken.mockRejectedValueOnce(new Error('storage failed'));
    await expect(context.logout()).rejects.toThrow('storage failed');
    expect(mocks.setUserInfo).not.toHaveBeenCalled();
    expect(mocks.reset).not.toHaveBeenCalled();
    await expect(context.logout()).resolves.toBeUndefined();
    expect(mocks.setUserInfo).toHaveBeenCalledOnce();
  });

  it('keeps runtime intact when credential storage fails and can retry', async () => {
    const context = renderProvider();
    mocks.setUserInfo.mockRejectedValueOnce(new Error('storage failed'));
    await expect(context.logout()).rejects.toThrow('storage failed');
    expect(mocks.reset).not.toHaveBeenCalled();
    await expect(context.logout()).resolves.toBeUndefined();
    expect(mocks.deleteToken).toHaveBeenCalledTimes(2);
  });
});
