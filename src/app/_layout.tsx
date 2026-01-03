import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';
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

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme } = useUnistyles();
  const { hasCredential, isLoading, error } = useRusaintSession();

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
      <SafeAreaView style={styles.root}>
        <Image
          contentFit="contain"
          source={loadingImage}
          style={{ width: 150, height: 150, marginBottom: 16 }}
        />
        <ThemedText typography="headingLg">로그인 정보를 불러오는 중이에요.</ThemedText>
        <ThemedText typography="bodyLg">잠시만 기다려주세요.</ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.root}>
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
      </SafeAreaView>
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
      <SafeAreaView style={styles.root}>
        <Image
          contentFit="contain"
          source={errorImage}
          style={{ width: 150, height: 150, marginBottom: 16 }}
        />
        <ThemedText color="error" typography="headingLg">
          정보를 가져오는 중 오류가 발생했어요.
        </ThemedText>
        <ThemedText color="errorInverted">{error.message}</ThemedText>
      </SafeAreaView>
    );
  }

  if (!success) {
    return (
      <SafeAreaView style={styles.root}>
        <Image
          contentFit="contain"
          source={loadingImage}
          style={{ width: 150, height: 150, marginBottom: 16 }}
        />
        <ThemedText typography="headingLg">데이터베이스를 업데이트하는 중이에요.</ThemedText>
        <ThemedText typography="bodyLg">잠시만 기다려주세요.</ThemedText>
      </SafeAreaView>
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
