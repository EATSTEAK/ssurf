import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { db } from '@/db';
import migrations from '@/drizzle/migrations';
import { RusaintApplicationProvider } from '@/shared/providers/RusaintApplicationProvider';
import {
  RusaintSessionProvider,
  useRusaintSession,
} from '@/shared/providers/RusaintSessionProvider';
import { SsurfLined } from '@/shared/ui/icons/SsurfLined';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme } = useUnistyles();
  const { hasCredential, isLoading } = useRusaintSession();

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
    return null;
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

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <SafeAreaView style={styles.root}>
        <SsurfLined height={48} width={48} />
        <ThemedText color="errorInverted" typography="headingMd">
          데이터베이스 업데이트 중 오류가 발생했어요.
        </ThemedText>
        <ThemedText color="errorInverted">{error.message}</ThemedText>
      </SafeAreaView>
    );
  }

  if (!success) {
    return (
      <SafeAreaView style={styles.root}>
        <SsurfLined height={48} width={48} />
        <ThemedText typography="headingMd">
          데이터베이스를 업데이트하는 중이에요. 잠시만 기다려주세요...
        </ThemedText>
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
