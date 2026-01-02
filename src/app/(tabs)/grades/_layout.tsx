import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  background: {
    backgroundColor: theme.colorsHex.surface,
  },
}));

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: styles.background.backgroundColor },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="graduation" />
    </Stack>
  );
}
