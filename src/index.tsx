import { registerRootComponent } from 'expo';
import 'expo-dev-client';
import { ExpoRoot } from 'expo-router';

import '@/unistyles';

export const REV: string = process.env.EXPO_PUBLIC_REV ?? 'dev';

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
