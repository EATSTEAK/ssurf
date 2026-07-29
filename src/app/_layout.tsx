import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles, withUnistyles } from 'react-native-unistyles';

import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';
import { feedSitesSync } from '@/entities/feed/lib/sync';
import { studentInformationSync } from '@/entities/studentInformation/lib/sync';
import {
  disableBackgroundUpdates,
  enableBackgroundUpdates,
  runUpdateDetection,
} from '@/shared/lib/backgroundUpdates';
import { ensure } from '@/shared/lib/syncEngine';
import { RusaintApplicationProvider } from '@/shared/providers/RusaintApplicationProvider';
import {
  RusaintSessionProvider,
  useRusaintSession,
} from '@/shared/providers/RusaintSessionProvider';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const UnistylesSafeAreaView = withUnistyles(SafeAreaView);

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme } = useUnistyles();
  const router = useRouter();
  const notificationResponse = Notifications.useLastNotificationResponse();
  const previousAppState = useRef(AppState.currentState);
  const { hasCredential, isLoading, error, session, studentId } = useRusaintSession();

  useEffect(() => {
    if (session && studentId) {
      void ensure(feedSitesSync());
      void ensure(studentInformationSync(studentId));
      void enableBackgroundUpdates(studentId).catch((error) =>
        console.error('Failed to enable background updates:', error),
      );
      void runUpdateDetection('foreground').catch((error) =>
        console.error('Initial update detection failed:', error),
      );
    } else if (hasCredential === false) {
      void disableBackgroundUpdates().catch((error) =>
        console.error('Failed to disable background updates:', error),
      );
    }
  }, [hasCredential, session, studentId]);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      const shouldCheck =
        nextState === 'active' &&
        (previousAppState.current === 'background' || previousAppState.current === 'inactive');
      previousAppState.current = nextState;

      if (shouldCheck) {
        void enableBackgroundUpdates(studentId).catch((error) =>
          console.error('Failed to refresh background update registration:', error),
        );
        void runUpdateDetection('foreground').catch((error) =>
          console.error('Foreground update detection failed:', error),
        );
      }
    });

    return () => subscription.remove();
  }, [studentId]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const category = notificationResponse?.notification.request.content.data?.category;
    switch (category) {
      case 'chapel':
        Notifications.clearLastNotificationResponse();
        router.push('/(tabs)/chapel');
        break;
      case 'courseGrade':
      case 'semesterGrade':
        Notifications.clearLastNotificationResponse();
        router.push('/(tabs)/grades');
        break;
      case 'notice':
        Notifications.clearLastNotificationResponse();
        router.push('/(tabs)/feed/notice');
        break;
    }
  }, [notificationResponse, router, session]);

  useEffect(() => {
    if (!isLoading && hasCredential !== null) {
      // credential 로딩이 완료되면 약간의 지연 후 스플래시 스크린 숨김
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 200);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isLoading, hasCredential]);

  if (isLoading) {
    return (
      <UnistylesSafeAreaView style={styles.root}>
        <Image
          contentFit="contain"
          source={loadingImage}
          style={{ width: 150, height: 150, marginBottom: 16 }}
        />
        <ThemedText typography="headingLg">로그인 정보를 불러오는 중이에요.</ThemedText>
        <ThemedText typography="bodyLg">잠시만 기다려주세요.</ThemedText>
      </UnistylesSafeAreaView>
    );
  }

  if (error) {
    return (
      <UnistylesSafeAreaView style={styles.root}>
        <Image
          contentFit="contain"
          source={errorImage}
          style={{ width: 150, height: 150, marginBottom: 16 }}
        />
        <ThemedText color="error" typography="headingLg">
          로그인 중 오류가 발생했어요.
        </ThemedText>
        <ThemedText color="errorInverted">{error.message}</ThemedText>
        <ThemedText color="errorInverted">앱을 다시 시작해주세요.</ThemedText>
      </UnistylesSafeAreaView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.surface,
        },
      }}
    >
      <Stack.Protected guard={!hasCredential}>
        <Stack.Screen name="(onboarding)/index" />
      </Stack.Protected>
      <Stack.Protected guard={!!hasCredential}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <UnistylesSafeAreaView style={styles.root}>
        <Image
          contentFit="contain"
          source={errorImage}
          style={{ width: 150, height: 150, marginBottom: 16 }}
        />
        <ThemedText color="error" typography="headingLg">
          정보를 가져오는 중 오류가 발생했어요.
        </ThemedText>
        <ThemedText color="errorInverted">{error.message}</ThemedText>
      </UnistylesSafeAreaView>
    );
  }

  if (!success) {
    return (
      <UnistylesSafeAreaView style={styles.root}>
        <Image
          contentFit="contain"
          source={loadingImage}
          style={{ width: 150, height: 150, marginBottom: 16 }}
        />
        <ThemedText typography="headingLg">데이터베이스를 업데이트하는 중이에요.</ThemedText>
        <ThemedText typography="bodyLg">잠시만 기다려주세요.</ThemedText>
      </UnistylesSafeAreaView>
    );
  }

  return (
    <RusaintSessionProvider>
      <RusaintApplicationProvider>
        <RootLayoutNav />
      </RusaintApplicationProvider>
    </RusaintSessionProvider>
  );
}
