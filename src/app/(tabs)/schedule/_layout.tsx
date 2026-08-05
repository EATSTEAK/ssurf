import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="search" />
      <Stack.Screen name="course/[term]/[code]/index" />
      <Stack.Screen name="course/[term]/[code]/syllabus" />
    </Stack>
  );
}
