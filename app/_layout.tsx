import { Stack } from 'expo-router';

import { RusaintProvider } from '@/components/providers/RusaintProvider';

export default function RootLayout() {
  return (
    <RusaintProvider>
      <Stack />
    </RusaintProvider>
  );
}
