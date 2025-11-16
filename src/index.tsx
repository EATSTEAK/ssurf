import { registerRootComponent } from 'expo';
import 'expo-dev-client';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { ExpoRoot } from 'expo-router';

import { expoDb } from '@/db';
import '@/unistyles';

export const REV: string = process.env.EXPO_PUBLIC_REV ?? 'dev';

// Must be exported or Fast Refresh won't update the context
export function App() {
  useDrizzleStudio(expoDb);
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
