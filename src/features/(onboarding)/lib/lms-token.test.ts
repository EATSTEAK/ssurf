import { describe, expect, it } from 'vitest';

import {
  createBridgeNonce,
  createCanvasTokenScript,
  isCanvasProfileSettingsUrl,
  parseLmsBridgeMessage,
  testCanvasAccessToken,
} from './lms-token';

describe('LMS token bridge', () => {
  it('creates a nonce when React Native does not provide Web Crypto', () => {
    const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} });

    try {
      expect(createBridgeNonce()).toMatch(/^[0-9a-z]+(?:-[0-9a-z]+){3}$/);
    } finally {
      if (cryptoDescriptor) {
        Object.defineProperty(globalThis, 'crypto', cryptoDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'crypto');
      }
    }
  });

  it('tests a Canvas token against the signed-in student profile', async () => {
    let authorization: null | string = null;
    const request: typeof fetch = async (_input, init) => {
      authorization = new Headers(init?.headers).get('Authorization');
      return new Response(JSON.stringify({ login_id: '20260001' }), { status: 200 });
    };

    await expect(testCanvasAccessToken('canvas-token', '20260001', request)).resolves.toBe(true);
    expect(authorization).toBe('Bearer canvas-token');
  });

  it('rejects invalid and mismatched Canvas tokens', async () => {
    const unauthorized: typeof fetch = async () => new Response(null, { status: 401 });
    const mismatched: typeof fetch = async () =>
      new Response(JSON.stringify({ login_id: 'different-student' }), { status: 200 });

    await expect(testCanvasAccessToken('invalid-token', '20260001', unauthorized)).resolves.toBe(
      false,
    );
    await expect(testCanvasAccessToken('valid-token', '20260001', mismatched)).resolves.toBe(false);
  });

  it('accepts tokens only from the trusted Canvas settings page', () => {
    expect(isCanvasProfileSettingsUrl('https://canvas.ssu.ac.kr/profile/settings')).toBe(true);
    expect(isCanvasProfileSettingsUrl('https://canvas.ssu.ac.kr.evil.test/profile/settings')).toBe(
      false,
    );
    expect(isCanvasProfileSettingsUrl('http://canvas.ssu.ac.kr/profile/settings')).toBe(false);
    expect(isCanvasProfileSettingsUrl('https://canvas.ssu.ac.kr:8443/profile/settings')).toBe(
      false,
    );
  });

  it('rejects malformed, untrusted, and short token messages', () => {
    const nonce = 'trusted-nonce';
    expect(parseLmsBridgeMessage('{bad json', nonce)).toBeNull();
    expect(
      parseLmsBridgeMessage(
        JSON.stringify({
          nonce: 'wrong-nonce',
          type: 'token',
          token: 'a-valid-canvas-token-value',
        }),
        nonce,
      ),
    ).toBeNull();
    expect(
      parseLmsBridgeMessage(JSON.stringify({ nonce, type: 'token', token: 'short' }), nonce),
    ).toBeNull();
    expect(
      parseLmsBridgeMessage(
        JSON.stringify({ nonce, type: 'token', token: 'a-valid-canvas-token-value' }),
        nonce,
      ),
    ).toEqual({ type: 'token', token: 'a-valid-canvas-token-value' });
  });

  it('safely embeds the stored credentials and requests a non-expiring token', () => {
    const credentials = { id: `20'26"01`, password: `pa\\ss\n'word"` };
    const script = createCanvasTokenScript('SSURF 모바일 앱', credentials, 'trusted-nonce');

    expect(() => new Function(script)).not.toThrow();
    expect(script).toContain(`const credentials = ${JSON.stringify(credentials)};`);
    expect(script).toContain("body.set('access_token[expires_at]', '');");
    expect(script).toContain("origin === 'https://smartid.ssu.ac.kr'");
    expect(script).not.toContain("origin === 'https://smartid.ssu.ac.kr:8443'");
    expect(script).toContain('profileIds.includes(credentials.id.trim())');
  });
});
