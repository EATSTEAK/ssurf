import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUnistyles } from 'react-native-unistyles';

import { RusaintApplicationProvider } from '@/components/providers/RusaintApplicationProvider';
import {
  RusaintSessionProvider,
  useRusaintSession,
} from '@/components/providers/RusaintSessionProvider';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';

function RootLayoutNav() {
  const { theme } = useUnistyles();
  const { hasCredential, session } = useRusaintSession();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.surface,
        },
      }}
    >
      <Stack.Protected guard={!hasCredential || !session}>
        <Stack.Screen name="(onboarding)/index" />
      </Stack.Protected>
      <Stack.Protected guard={hasCredential && !!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <SafeAreaView>
        <Text>{error.message}</Text>
      </SafeAreaView>
    );
  }

  if (!success) {
    return (
      <SafeAreaView>
        <Text>Running migrations...</Text>
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
