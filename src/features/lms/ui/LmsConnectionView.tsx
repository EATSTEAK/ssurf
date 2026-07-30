import { WebView } from '@expo/dom-webview';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  CANVAS_LOGIN_URL,
  createBridgeNonce,
  createCanvasTokenScript,
  isCanvasProfileSettingsUrl,
  LmsBridgeMessage,
  parseLmsBridgeMessage,
} from '@/features/lms/lib/lmsToken';
import { saveCanvasAccessToken, StoredCredentials } from '@/shared/lib/credentials';
import { ChevronLeftIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

type ConnectionStatus = 'saving' | Extract<LmsBridgeMessage, { type: 'status' }>['status'];

const statusCopy: Record<ConnectionStatus, string> = {
  'awaiting-login': 'LearningX 로그인을 기다리고 있어요',
  'opening-sso': '숭실대학교 통합 로그인을 여는 중이에요',
  'signing-in': '저장된 학교 계정으로 로그인하는 중이에요',
  'opening-settings': 'LearningX 연결 화면을 여는 중이에요',
  'creating-token': '만료 없는 연결 토큰을 만드는 중이에요',
  saving: '연결 정보를 안전하게 저장하는 중이에요',
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    gap: theme.gap(1.5),
    paddingHorizontal: theme.gap(2.5),
    paddingBottom: theme.gap(2),
    backgroundColor: theme.colors.surface,
  },
  headerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: theme.cornerRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceDim,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  status: {
    minHeight: 38,
    paddingHorizontal: theme.gap(1.5),
    borderRadius: theme.cornerRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
    backgroundColor: theme.colors.primaryContainer,
  },
  webView: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.cornerRadius.lg,
    borderTopRightRadius: theme.cornerRadius.lg,
  },
  errorBanner: {
    gap: theme.gap(1.5),
    padding: theme.gap(2),
    backgroundColor: theme.colors.errorContainer,
  },
}));

export type LmsConnectionViewProps = {
  credentials: StoredCredentials;
  onClose: () => void;
  onConnected: () => void;
};

export const LmsConnectionView = ({
  credentials,
  onClose,
  onConnected,
}: LmsConnectionViewProps) => {
  const { theme } = useUnistyles();
  const completedRef = useRef(false);
  const pendingTokenRef = useRef<null | string>(null);
  const [status, setStatus] = useState<ConnectionStatus>('awaiting-login');
  const [error, setError] = useState<null | string>(null);
  const [bridgeNonce, setBridgeNonce] = useState(createBridgeNonce);
  const tokenScript = createCanvasTokenScript('SSURF 모바일 앱', credentials, bridgeNonce);

  const persistToken = async (token: string) => {
    completedRef.current = true;
    pendingTokenRef.current = token;
    setStatus('saving');
    try {
      await saveCanvasAccessToken(credentials.id, token);
      pendingTokenRef.current = null;
      onConnected();
    } catch (error) {
      completedRef.current = false;
      setError(error instanceof Error ? error.message : '연결 토큰을 저장하지 못했어요.');
    }
  };

  const handleMessage = async (raw: string, url: string) => {
    const message = parseLmsBridgeMessage(raw, bridgeNonce);
    if (!message || completedRef.current) {
      return;
    }

    if (message.type === 'status') {
      setStatus(message.status);
      return;
    }

    if (message.type === 'error') {
      setError(message.message);
      return;
    }

    if (!isCanvasProfileSettingsUrl(url)) {
      return;
    }

    await persistToken(message.token);
  };

  const retry = () => {
    setError(null);
    if (pendingTokenRef.current) {
      void persistToken(pendingTokenRef.current);
      return;
    }
    completedRef.current = false;
    setStatus('awaiting-login');
    setBridgeNonce(createBridgeNonce());
  };

  if (process.env.EXPO_OS === 'web') {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable accessibilityLabel="뒤로" onPress={onClose} style={styles.closeButton}>
              <ChevronLeftIcon color={theme.colorsHex.fgSurface} />
            </Pressable>
            <ThemedText typography="headingLg">LearningX 연결</ThemedText>
          </View>
          <ThemedText>LearningX 연결은 iOS 또는 Android 앱에서 진행해주세요.</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={{ bottom: 'off', top: 'additive' }} style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityLabel="연결 화면 닫기"
            onPress={onClose}
            style={styles.closeButton}
          >
            <ChevronLeftIcon color={theme.colorsHex.fgSurface} />
          </Pressable>
          <View style={styles.titleGroup}>
            <ThemedText typography="headingMd">LearningX 연결</ThemedText>
            <ThemedText color="fgSurfaceMuted" typography="bodySm">
              저장된 학교 계정으로 로그인하고 토큰을 자동 생성해요
            </ThemedText>
          </View>
        </View>
        <View accessibilityLiveRegion="polite" style={styles.status}>
          <ActivityIndicator color={theme.colorsHex.primaryInverted} size="small" />
          <ThemedText color="fgPrimaryContainer" typography="labelLg">
            {statusCopy[status]}
          </ThemedText>
        </View>
      </View>
      {error && (
        <View accessibilityLiveRegion="assertive" style={styles.errorBanner}>
          <ThemedText color="fgErrorContainer" selectable typography="bodyMd">
            {error}
          </ThemedText>
          <Button onPress={retry} variant="error">
            다시 시도
          </Button>
        </View>
      )}
      <WebView
        automaticallyAdjustContentInsets={false}
        bounces={false}
        containerStyle={styles.webView}
        hideKeyboardAccessoryView
        injectedJavaScript={tokenScript}
        key={bridgeNonce}
        onContentProcessDidTerminate={() =>
          setError('LearningX 연결 화면이 종료됐어요. 다시 시도해주세요.')
        }
        onMessage={(event) => void handleMessage(event.nativeEvent.data, event.nativeEvent.url)}
        onRenderProcessGone={() => setError('LearningX 연결 화면이 종료됐어요. 다시 시도해주세요.')}
        showsHorizontalScrollIndicator={false}
        source={{ uri: CANVAS_LOGIN_URL }}
        webviewDebuggingEnabled={__DEV__}
      />
    </SafeAreaView>
  );
};
