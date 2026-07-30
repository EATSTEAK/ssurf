import type { StoredCredentials } from '@/shared/lib/credentials';

export const CANVAS_BASE_URL = 'https://canvas.ssu.ac.kr';
export const CANVAS_LOGIN_URL = `${CANVAS_BASE_URL}/login`;

export const createBridgeNonce = () => {
  const values = new Uint32Array(4);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(values);
  } else {
    // ponytail: RN may lack Web Crypto; use expo-crypto if this becomes a long-lived credential.
    values.set(Array.from({ length: values.length }, () => Math.random() * 2 ** 32));
  }
  return Array.from(values, (value) => value.toString(36)).join('-');
};

const bridgeStatuses = [
  'awaiting-login',
  'opening-sso',
  'signing-in',
  'opening-settings',
  'creating-token',
] as const;

export type LmsBridgeMessage =
  | { message: string; type: 'error' }
  | { status: (typeof bridgeStatuses)[number]; type: 'status' }
  | { token: string; type: 'token' };

export const isCanvasProfileSettingsUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.origin === CANVAS_BASE_URL && parsed.pathname === '/profile/settings';
  } catch {
    return false;
  }
};

export const testCanvasAccessToken = async (
  token: string,
  studentId: string,
  request: typeof fetch = fetch,
) => {
  if (!token) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await request(`${CANVAS_BASE_URL}/api/v1/users/self/profile`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    if (response.status === 401 || response.status === 403) {
      return false;
    }
    if (!response.ok) {
      throw new Error(`LearningX 연결 확인에 실패했어요. (${response.status})`);
    }

    const profile: unknown = await response.json();
    if (typeof profile !== 'object' || profile === null) {
      return false;
    }
    const profileRecord = profile as Record<string, unknown>;
    const profileIds = [profileRecord.login_id, profileRecord.sis_user_id]
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim());
    return profileIds.includes(studentId.trim());
  } finally {
    clearTimeout(timeout);
  }
};

export const parseLmsBridgeMessage = (raw: string, nonce: string): LmsBridgeMessage | null => {
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== 'object' ||
      value === null ||
      !('type' in value) ||
      !('nonce' in value) ||
      value.nonce !== nonce
    ) {
      return null;
    }

    if (
      value.type === 'status' &&
      'status' in value &&
      typeof value.status === 'string' &&
      (bridgeStatuses as readonly string[]).includes(value.status)
    ) {
      return { status: value.status as (typeof bridgeStatuses)[number], type: 'status' };
    }

    if (
      value.type === 'token' &&
      'token' in value &&
      typeof value.token === 'string' &&
      value.token.length > 20
    ) {
      return { token: value.token, type: 'token' };
    }

    if (
      value.type === 'error' &&
      'message' in value &&
      typeof value.message === 'string' &&
      value.message.length > 0
    ) {
      return { message: value.message, type: 'error' };
    }
  } catch {
    // Ignore messages that were not emitted by the token automation script.
  }

  return null;
};

export const createCanvasTokenScript = (
  purpose: string,
  credentials: StoredCredentials,
  nonce: string,
) => `
(function () {
  if (window.top !== window || window.__ssurfCanvasTokenAutomation) {
    return true;
  }
  window.__ssurfCanvasTokenAutomation = true;

  const bridge = window.ReactNativeWebView;
  if (!bridge || typeof bridge.postMessage !== 'function') {
    return true;
  }

  const bridgeNonce = ${JSON.stringify(nonce)};
  const post = (payload) =>
    bridge.postMessage(JSON.stringify({ ...payload, nonce: bridgeNonce }));
  const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  const credentials = ${JSON.stringify(credentials)};
  const tokenPurpose = ${JSON.stringify(purpose)};
  const tokenFromJson = (value) => {
    if (typeof value === 'string') {
      return value.length > 20 ? value : null;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        const token = tokenFromJson(item);
        if (token) return token;
      }
      return null;
    }
    if (value && typeof value === 'object') {
      for (const key of ['token', 'visible_token', 'access_token']) {
        if (key in value) {
          const token = tokenFromJson(value[key]);
          if (token) return token;
        }
      }
    }
    return null;
  };

  void (async () => {
    try {
      if (window.location.protocol !== 'https:') {
        return;
      }

      const origin = window.location.origin;
      const pathname = window.location.pathname.toLowerCase();

      if (origin === 'https://lms.ssu.ac.kr' && pathname === '/xn-sso/login.php') {
        const ssoUrl = Array.from(document.querySelectorAll('a[href]'))
          .map((link) => new URL(link.href, window.location.href))
          .find(
            (url) =>
              url.origin === 'https://smartid.ssu.ac.kr' &&
              url.pathname.toLowerCase() === '/symtra_sso/smln.asp',
          );
        if (!ssoUrl) {
          throw new Error('숭실대학교 통합 로그인 화면을 찾지 못했어요.');
        }
        post({ type: 'status', status: 'opening-sso' });
        window.location.replace(ssoUrl.href);
        return;
      }

      if (origin === 'https://smartid.ssu.ac.kr' && pathname === '/symtra_sso/smln.asp') {
        const idInput = document.querySelector('input[name="userid"]');
        const passwordInput = document.querySelector('input[name="pwd"]');
        const form = document.querySelector('form[name="LoginInfo"]');
        if (!idInput || !passwordInput || !form) {
          throw new Error('숭실대학교 로그인 입력란을 찾지 못했어요.');
        }

        post({ type: 'status', status: 'signing-in' });
        idInput.value = credentials.id;
        passwordInput.value = credentials.password;
        idInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          if (
            window.location.origin === 'https://smartid.ssu.ac.kr' &&
            window.location.pathname.toLowerCase() === '/symtra_sso/smln.asp'
          ) {
            post({ type: 'error', message: 'LearningX 로그인에 실패했어요. 학교 계정 정보를 확인해주세요.' });
          }
        }, 15000);
        HTMLFormElement.prototype.submit.call(form);
        return;
      }

      if (origin !== '${CANVAS_BASE_URL}') {
        return;
      }

      const profileResponse = await fetch('/api/v1/users/self/profile', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (!profileResponse.ok) {
        post({ type: 'status', status: 'awaiting-login' });
        return;
      }

      const profile = await profileResponse.json();
      const profileIds = [profile?.login_id, profile?.sis_user_id]
        .filter((value) => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim());
      if (!profileIds.includes(credentials.id.trim())) {
        post({
          type: 'error',
          message: '다른 LearningX 계정이 로그인되어 있어 로그아웃했어요. 다시 시도해주세요.',
        });
        window.location.replace('${CANVAS_BASE_URL}/logout');
        return;
      }

      if (window.location.pathname !== '/profile/settings') {
        post({ type: 'status', status: 'opening-settings' });
        window.location.href = '${CANVAS_BASE_URL}/profile/settings';
        return;
      }

      post({ type: 'status', status: 'creating-token' });

      const csrf =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
        document.querySelector('input[name="authenticity_token"]')?.value;
      if (!csrf) {
        throw new Error('Canvas 보안 토큰을 찾지 못했어요.');
      }

      document.querySelector('.add_access_token_link')?.click();
      await wait(400);

      const purposeInput = document.querySelector('input[name="access_token[purpose]"]');
      const form =
        document.querySelector('form[action*="/profile/tokens"]') || purposeInput?.closest('form');
      if (!form) {
        throw new Error('Canvas 토큰 생성 화면을 찾지 못했어요.');
      }

      const action = new URL(form.getAttribute('action') || '/profile/tokens', window.location.href);
      if (action.origin !== window.location.origin || !action.pathname.includes('/profile/tokens')) {
        throw new Error('Canvas 토큰 생성 주소를 확인하지 못했어요.');
      }

      const body = new URLSearchParams(new FormData(form));
      body.set('utf8', body.get('utf8') || '');
      body.set('authenticity_token', body.get('authenticity_token') || csrf);
      body.set('purpose', tokenPurpose);
      body.set('access_token[purpose]', tokenPurpose);
      body.set('expires_at', '');
      body.set('access_token[expires_at]', '');
      body.set('_method', 'post');

      const response = await fetch(action.href, {
        method: 'POST',
        credentials: 'include',
        referrer: '${CANVAS_BASE_URL}/profile/settings',
        headers: {
          Accept: 'application/json, text/javascript, application/json+canvas-string-ids, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-CSRF-Token': csrf,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: body.toString(),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error('Canvas 토큰 생성 요청이 실패했어요. (' + response.status + ')');
      }

      const token = tokenFromJson(responseText ? JSON.parse(responseText) : null);
      if (!token) {
        throw new Error('생성된 Canvas 토큰을 찾지 못했어요.');
      }

      post({ type: 'token', token });
    } catch (error) {
      post({
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  })();

  return true;
})();
`;
