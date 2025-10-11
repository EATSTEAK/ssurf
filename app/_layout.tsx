import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { RusaintApplicationProvider } from '@/components/providers/RusaintApplicationProvider';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
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
    <RusaintApplicationProvider>
      <Stack />
    </RusaintApplicationProvider>
  );
}
