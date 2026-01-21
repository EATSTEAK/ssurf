import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  background: {
    backgroundColor: theme.colorsHex.surface,
  },
}));

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: styles.background.backgroundColor },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="notification" />
    </Stack>
  );
}
