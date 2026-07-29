import { Stack } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';

export default function StackLayout() {
  const { theme } = useUnistyles();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colorsHex.surface },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="graduation" />
    </Stack>
  );
}
