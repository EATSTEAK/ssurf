import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

vi.mock('react-native', () => ({ Pressable: 'Pressable', Text: 'Text' }));
vi.mock('@/shared/lib/propagateState', () => import('../../lib/propagateState'));
vi.mock('react-native-unistyles', () => ({
  StyleSheet: {
    create: (factory: (theme: { colors: Record<string, string> }) => object) => ({
      ...factory({
        colors: Object.fromEntries(
          [
            'primary',
            'primaryPressed',
            'primaryContainer',
            'fgPrimary',
            'secondary',
            'secondaryPressed',
            'fgSecondary',
            'error',
            'errorPressed',
            'errorContainer',
            'fgError',
            'success',
            'successPressed',
            'successContainer',
            'fgSuccess',
            'surface',
            'surfaceDim',
            'fgSurface',
            'fgSurfaceMuted',
          ].map((color) => [color, color]),
        ),
      }),
      useVariants: vi.fn(),
    }),
  },
}));

const variants = [
  ['primary', 'primaryContainer', 'primary', 'primaryPressed'],
  ['secondary', 'surface', 'secondary', 'secondaryPressed'],
  ['error', 'errorContainer', 'error', 'errorPressed'],
  ['success', 'successContainer', 'success', 'successPressed'],
  ['surface', 'surfaceDim', 'surface', 'surfaceDim'],
  ['ghost', 'transparent', 'transparent', 'rgba(0, 0, 0, 0.2)'],
  ['outline', 'transparent', 'transparent', 'rgba(0, 0, 0, 0.2)'],
] as const;

describe('Button disabled state', () => {
  it.each(variants)('%s uses the disabled colors regardless of pressed state', (variant, color) => {
    const button = Button({ variant, disabled: true, children: 'Text' });

    expect(button.props.disabled).toBe(true);
    expect(button.props.accessibilityRole).toBe('button');
    for (const pressed of [false, true]) {
      const [container] = button.props.style({ pressed });
      const label = button.props.children({ pressed });

      expect(container.opacity).toBe(0.5);
      expect(container.variants.variant[variant].backgroundColor).toBe(color);
      expect(label.props.style[1]).toEqual({ color: 'fgSurfaceMuted' });
      if (variant === 'outline') {
        expect(container.variants.variant.outline.borderColor).toBe('fgSurfaceMuted');
      }
    }
  });

  it.each(variants)('%s preserves enabled and pressed colors', (variant, _, normal, pressed) => {
    const button = Button({ variant, children: 'Text' });

    expect(
      button.props.style({ pressed: false })[0].variants.variant[variant].backgroundColor,
    ).toBe(normal);
    expect(button.props.style({ pressed: true })[0].variants.variant[variant].backgroundColor).toBe(
      pressed,
    );
    expect(button.props.style({ pressed: false })[0].opacity).toBe(1);
    expect(button.props.children({ pressed: false }).props.style[1]).toBeFalsy();
  });

  it('preserves callbacks, custom content, styles and other accessibility state', () => {
    const content = createElement('CustomContent');
    const onPress = vi.fn();
    const style = vi.fn(() => ({ height: 44 }));
    const textStyle = vi.fn(() => ({ fontWeight: '500' as const }));
    const button = Button({
      disabled: true,
      accessibilityState: { busy: true },
      onPress,
      style,
      textStyle,
      children: ({ pressed }) => (pressed ? content : 'Text'),
    });

    expect(button.props.onPress).toBe(onPress);
    expect(button.props.accessibilityState).toEqual({ busy: true });
    expect(button.props.style({ pressed: false })[1]).toEqual({ height: 44 });
    expect(style).toHaveBeenCalledWith({ pressed: false });
    expect(button.props.children({ pressed: false }).props.style[2]).toEqual({ fontWeight: '500' });
    expect(textStyle).toHaveBeenCalledWith({ pressed: false });
    expect(button.props.children({ pressed: true })).toBe(content);
  });
});
