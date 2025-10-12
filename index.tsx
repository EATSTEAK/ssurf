import { registerRootComponent } from 'expo';
import 'expo-dev-client';
import { ExpoRoot } from 'expo-router';

import '@/unistyles';

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
