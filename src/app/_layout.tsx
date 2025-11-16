import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';
import { RusaintApplicationProvider } from '@/components/providers/RusaintApplicationProvider';
import {
  RusaintSessionProvider,
  useRusaintSession,
} from '@/components/providers/RusaintSessionProvider';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';
import { SsurfLined } from '@/icons/SsurfLined';

function RootLayoutNav() {
  const { theme } = useUnistyles();
  const { hasCredential } = useRusaintSession();

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
      <Stack.Protected guard={hasCredential}>
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
