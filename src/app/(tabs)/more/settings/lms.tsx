import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { testCanvasAccessToken } from '@/features/(onboarding)/lib/lms-token';
import { LmsConnectionView } from '@/features/(onboarding)/ui/lms-connection-view';
import {
  deleteCanvasAccessToken,
  getCanvasAccessToken,
  getStoredCredentials,
  StoredCredentials,
} from '@/shared/lib/credentials';
import { useRusaintSession } from '@/shared/providers/RusaintSessionProvider';
import { CardView } from '@/shared/ui/containers/CardView';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { Button } from '@/shared/ui/primitives/Button';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

type Action = 'connecting' | 'disconnecting' | 'testing';
type TestResult = 'error' | 'idle' | 'invalid' | 'valid';

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: theme.gap(8),
  },
  topView: {
    width: '100%',
    gap: theme.gap(1),
    padding: theme.gap(3),
  },
  statusCard: {
    minHeight: 180,
  },
  statusRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.gap(2),
  },
  details: {
    gap: theme.gap(1),
  },
  actions: {
    flexDirection: 'row',
    gap: theme.gap(1.5),
  },
  button: {
    flex: 1,
  },
}));

export default function LmsSettingsScreen() {
  const { studentId } = useRusaintSession();
  const scrollY = useSharedValue(0);
  const [token, setToken] = useState<null | string>(null);
  const [credentials, setCredentials] = useState<null | StoredCredentials>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<Action | null>(null);
  const [testResult, setTestResult] = useState<TestResult>('idle');

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }
    void getCanvasAccessToken(studentId)
      .then((storedToken) => setToken(storedToken || null))
      .catch(() => Alert.alert('LMS 설정 확인 실패', '잠시 후 다시 시도해 주세요.'))
      .finally(() => setIsLoading(false));
  }, [studentId]);

  const connect = async () => {
    setAction('connecting');
    try {
      const storedCredentials = await getStoredCredentials();
      if (!storedCredentials) {
        Alert.alert('LMS 연결 실패', '저장된 학교 계정 정보가 없어요. 다시 로그인해주세요.');
        return;
      }
      setCredentials(storedCredentials);
    } catch {
      Alert.alert('LMS 연결 실패', '잠시 후 다시 시도해 주세요.');
    } finally {
      setAction(null);
    }
  };

  const finishConnection = async () => {
    try {
      if (!studentId) {
        throw new Error('로그인된 학번이 없어요.');
      }
      const storedToken = await getCanvasAccessToken(studentId);
      setToken(storedToken || null);
      setTestResult('idle');
    } catch {
      Alert.alert('LMS 설정 확인 실패', '연결은 완료됐지만 상태를 불러오지 못했어요.');
    } finally {
      setCredentials(null);
    }
  };

  const testConnection = async () => {
    if (!token || !studentId) {
      return;
    }
    setAction('testing');
    setTestResult('idle');
    try {
      const valid = await testCanvasAccessToken(token, studentId);
      if (valid) {
        setTestResult('valid');
      } else {
        await deleteCanvasAccessToken(studentId);
        setToken(null);
        setTestResult('invalid');
      }
    } catch {
      setTestResult('error');
    } finally {
      setAction(null);
    }
  };

  const disconnect = () => {
    Alert.alert('LMS 연동 해제', '이 기기에 저장된 LearningX 토큰을 삭제할까요?', [
      { style: 'cancel', text: '취소' },
      {
        style: 'destructive',
        text: '연동 해제',
        onPress: () => {
          if (!studentId) {
            return;
          }
          setAction('disconnecting');
          void deleteCanvasAccessToken(studentId)
            .then(() => {
              setToken(null);
              setTestResult('idle');
            })
            .catch(() => Alert.alert('LMS 연동 해제 실패', '잠시 후 다시 시도해 주세요.'))
            .finally(() => setAction(null));
        },
      },
    ]);
  };

  if (credentials) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <LmsConnectionView
          credentials={credentials}
          onClose={() => setCredentials(null)}
          onConnected={() => void finishConnection()}
        />
      </>
    );
  }

  const connected = token != null;
  const message =
    testResult === 'valid'
      ? 'LearningX API 연결이 정상이에요.'
      : testResult === 'invalid'
        ? '연결 정보가 유효하지 않아 기기에서 삭제했어요. 다시 연동해주세요.'
        : testResult === 'error'
          ? '네트워크 오류로 연결을 확인하지 못했어요. 잠시 후 다시 시도해주세요.'
          : connected
            ? '토큰이 안전하게 저장되어 있어요. 연동 테스트로 유효성을 확인할 수 있어요.'
            : 'LearningX가 연동되어 있지 않아요.';
  const messageColor =
    testResult === 'valid'
      ? 'fgSuccessContainer'
      : testResult === 'invalid' || testResult === 'error'
        ? 'fgErrorContainer'
        : 'fgSecondary';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: 'LMS 설정',
          headerTitle: () => <></>,
        }}
      />
      <View style={styles.root}>
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="LMS 설정" />
              <ThemedText color="fgSecondary" typography="labelMd">
                LearningX 연결을 관리하세요
              </ThemedText>
            </View>
            <CardView style={styles.statusCard}>
              <View style={styles.statusRow}>
                <ThemedText typography="headingLg">연동 상태</ThemedText>
                {isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <ThemedText
                    color={connected ? 'fgSuccessContainer' : 'fgSecondary'}
                    typography="labelLg"
                  >
                    {connected ? '연동됨' : '연동 안 됨'}
                  </ThemedText>
                )}
              </View>
              <View style={styles.details}>
                {connected && studentId ? (
                  <ThemedText selectable typography="bodyMd">
                    연결 계정: {studentId}
                  </ThemedText>
                ) : null}
                <ThemedText color={messageColor} selectable typography="bodyMd">
                  {message}
                </ThemedText>
              </View>
              {!isLoading && connected ? (
                <View style={styles.actions}>
                  <Button
                    disabled={action != null}
                    onPress={() => void testConnection()}
                    style={styles.button}
                  >
                    {action === 'testing' ? '확인 중...' : '연동 테스트'}
                  </Button>
                  <Button
                    disabled={action != null}
                    onPress={disconnect}
                    style={styles.button}
                    variant="error"
                  >
                    {action === 'disconnecting' ? '해제 중...' : '연동 해제'}
                  </Button>
                </View>
              ) : null}
              {!isLoading && !connected ? (
                <Button disabled={action != null} onPress={() => void connect()} variant="success">
                  {action === 'connecting' ? '연결 준비 중...' : '연동하기'}
                </Button>
              ) : null}
            </CardView>
          </SafeContainer>
        </Animated.ScrollView>
        <FloatingHeader scrollY={scrollY} title="LMS 설정" />
      </View>
    </>
  );
}
