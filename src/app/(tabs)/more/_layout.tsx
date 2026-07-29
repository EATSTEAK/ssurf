import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="developer" />
      <Stack.Screen name="settings/feed" />
      <Stack.Screen name="settings/notifications" />
    </Stack>
  );
}
