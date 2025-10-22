import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import { RusaintApplicationProvider } from '@/components/providers/RusaintApplicationProvider';
import { RusaintSessionProvider } from '@/components/providers/RusaintSessionProvider';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const { theme } = useUnistyles();
  if (error) {
    return (
      <View>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Running migrations...</Text>
      </View>
    );
  }

  return (
    <RusaintSessionProvider>
      <RusaintApplicationProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
      </RusaintApplicationProvider>
    </RusaintSessionProvider>
  );
}
