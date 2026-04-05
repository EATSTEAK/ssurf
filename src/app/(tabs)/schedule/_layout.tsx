import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="calendar-week-test" />
    </Stack>
  );
}
