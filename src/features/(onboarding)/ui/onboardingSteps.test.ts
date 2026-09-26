import type { ReactElement, ReactNode } from 'react';
import type { GestureResponderEvent } from 'react-native';

import * as Notifications from 'expo-notifications';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LmsConnectionView } from '@/features/lms/ui/LmsConnectionView';
import { enableBackgroundUpdates } from '@/shared/lib/backgroundUpdates';
import { getCanvasAccessToken, getStoredCredentials } from '@/shared/lib/credentials';
import { Icon } from '@/shared/ui/icons';
import { Button, ButtonProps } from '@/shared/ui/primitives/Button';

import { PermissionsStep } from './OnboardingSteps';

const hooks = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0, setState: vi.fn() }));

// Keep state between explicit renders without adding a native renderer dependency.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof React>()),
  useEffect: vi.fn(),
  useState: (initial: unknown) => {
    const index = hooks.cursor++;
    if (!(index in hooks.values)) {
      hooks.values[index] = initial;
    }
    return [
      hooks.values[index],
      (value: unknown) => {
        hooks.values[index] = value;
        hooks.setState(index, value);
      },
    ];
  },
}));
vi.mock('expo-image', () => ({ Image: 'Image' }));
vi.mock('expo-notifications', () => ({ getPermissionsAsync: vi.fn() }));
vi.mock('react-native', () => ({
  Alert: { alert: vi.fn() },
  ScrollView: 'ScrollView',
  View: 'View',
}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
vi.mock('react-native-unistyles', () => {
  const theme = {
    colors: { primary: 'primary', surface: 'surface' },
    colorsHex: { fgSurfaceMuted: '#888888' },
    gap: (value: number) => value * 8,
    typography: { heading: { md: { fontSize: 18 } } },
  };
  return {
    StyleSheet: { create: (factory: (value: typeof theme) => object) => factory(theme) },
    useUnistyles: () => ({ theme }),
    withUnistyles: (component: unknown) => component,
  };
});
vi.mock('@/assets/loading.png', () => ({ default: 'loading.png' }));
vi.mock('@/features/lms/ui/LmsConnectionView', () => ({ LmsConnectionView: 'LmsConnectionView' }));
vi.mock('@/shared/lib/backgroundUpdates', () => ({ enableBackgroundUpdates: vi.fn() }));
vi.mock('@/shared/lib/credentials', () => ({
  getCanvasAccessToken: vi.fn(),
  getStoredCredentials: vi.fn(),
}));
vi.mock('@/shared/ui/icons', () => ({ Icon: 'Icon' }));
vi.mock('@/shared/ui/icons/SsurfLined', () => ({ SsurfLined: 'SsurfLined' }));
vi.mock('@/shared/ui/primitives/Button', () => ({ Button: 'Button' }));
vi.mock('@/shared/ui/primitives/ThemedText', () => ({ ThemedText: 'ThemedText' }));
vi.mock('@/shared/ui/Wave', () => ({ Wave: 'Wave' }));

const studentId = '20240001';
const onNext = vi.fn();
const pressEvent = {} as GestureResponderEvent;

function renderStep() {
  hooks.cursor = 0;
  return PermissionsStep({ onNext, studentId });
}

function findButtons(node: ReactNode): ReactElement<ButtonProps>[] {
  const buttons: ReactElement<ButtonProps>[] = [];
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement<{ children?: ReactNode }>(child)) {
      return;
    }
    if (child.type === Button) {
      buttons.push(child as ReactElement<ButtonProps>);
    } else {
      buttons.push(...findButtons(child.props.children));
    }
  });
  return buttons;
}

function expectCompleted(button: ReactElement<ButtonProps>, label: string) {
  expect(button.props.disabled).toBe(true);
  expect(button.props.accessibilityState).toEqual({ disabled: true });
  expect(button.props.accessibilityLabel).toBe(label);
  expect(button.props.variant).toBe('success');

  const content = button.props.children as ReactElement<{ children: ReactElement[] }>;
  const [text, icon] = content.props.children;
  expect(text.props).toMatchObject({
    children: '완료됨',
    color: 'fgSurfaceMuted',
    typography: 'headingMd',
  });
  expect(icon.type).toBe(Icon);
  expect(icon.props).toMatchObject({
    color: '#888888',
    materialName: 'check',
    symbolName: 'checkmark',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  hooks.values = [];
  // Vitest uses the classic JSX transform with Expo's tsconfig.
  vi.stubGlobal('React', React);
  vi.mocked(getStoredCredentials).mockResolvedValue({ id: studentId, password: 'test-password' });
});

afterEach(() => vi.unstubAllGlobals());

describe('onboarding permission buttons', () => {
  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ])('restores LMS=%s and notifications=%s independently', async (lms, notifications) => {
    vi.mocked(Notifications.getPermissionsAsync, { partial: true }).mockResolvedValue({
      granted: notifications,
    });
    vi.mocked(getCanvasAccessToken).mockResolvedValue(lms ? 'stored-token' : null);

    renderStep();
    vi.mocked(React.useEffect).mock.calls[0][0]();
    await vi.waitFor(() => expect(hooks.setState).toHaveBeenCalledTimes(2));

    const [lmsButton, notificationButton, nextButton] = findButtons(renderStep());
    for (const [button, completed, activeLabel, completedLabel] of [
      [lmsButton, lms, '로그인', 'LMS 로그인 완료됨'],
      [notificationButton, notifications, '알림 허용', '알림 설정 완료됨'],
    ] as const) {
      if (completed) {
        expectCompleted(button, completedLabel);
      } else {
        expect(button.props.children).toBe(activeLabel);
        expect(button.props.disabled).toBe(false);
        expect(button.props.accessibilityState).toEqual({ disabled: false });
      }
    }
    expect(getCanvasAccessToken).toHaveBeenCalledWith(studentId);
    expect(nextButton.props.children).toBe('다음');
    expect(nextButton.props.disabled).toBeFalsy();
    nextButton.props.onPress!(pressEvent);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('shows a check only after completing each action, not while preparing LMS', async () => {
    const [lmsButton] = findButtons(renderStep());
    lmsButton.props.onPress!(pressEvent);
    const [preparingButton] = findButtons(renderStep());
    expect(preparingButton.props.children).toBe('연결 준비 중...');
    expect(preparingButton.props.disabled).toBe(true);
    await vi.waitFor(() => expect(renderStep().type).toBe(LmsConnectionView));

    renderStep().props.onConnected();
    const [completedLms, notificationButton] = findButtons(renderStep());
    expectCompleted(completedLms, 'LMS 로그인 완료됨');
    expect(notificationButton.props.children).toBe('알림 허용');

    vi.mocked(enableBackgroundUpdates).mockResolvedValue(true);
    await notificationButton.props.onPress!(pressEvent);
    expect(enableBackgroundUpdates).toHaveBeenCalledWith(studentId, true);
    expectCompleted(findButtons(renderStep())[1], '알림 설정 완료됨');
  });

  it('keeps canceled LMS and denied notifications available for retry', async () => {
    findButtons(renderStep())[0].props.onPress!(pressEvent);
    await vi.waitFor(() => expect(renderStep().type).toBe(LmsConnectionView));
    renderStep().props.onClose();

    vi.mocked(enableBackgroundUpdates).mockResolvedValue(false);
    await findButtons(renderStep())[1].props.onPress!(pressEvent);
    const [lmsButton, notificationButton] = findButtons(renderStep());
    expect(lmsButton.props.children).toBe('로그인');
    expect(lmsButton.props.disabled).toBe(false);
    expect(notificationButton.props.children).toBe('알림 허용');
    expect(notificationButton.props.disabled).toBe(false);
  });
});
