import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useLoading } from 'react-simplikit';

import { Button } from '@/components/primitives/Button';
import { TextField } from '@/components/primitives/TextField';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';

const styles = StyleSheet.create((theme) => ({
  view: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingHorizontal: 32,
    backgroundColor: theme.colors.primary,
  },
}));

export const LoginForm = () => {
  const { login, hasCredential } = useRusaintSession();
  const [isLoading, startLoading] = useLoading();

  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const onPressLoginButton = async () => {
    await startLoading(login(id, password));
    if (hasCredential) {
      console.log('redirecting to chapel...');
      router.replace('/(tabs)/chapel');
    }
  };

  return (
    <SafeAreaView style={styles.view}>
      <ThemedText typography="heading2xl">유세인트 로그인</ThemedText>

      <TextField onChangeText={setId} placeholder="학번" value={id} />
      <TextField
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
      />

      <ThemedText color="fgSecondary" typography="labelSm">
        학번 및 비밀번호는 사용자 기기에만 저장돼요.
      </ThemedText>

      <Button
        disabled={isLoading || !id || !password}
        onPress={onPressLoginButton}
        style={{ width: '100%' }}
      >
        <Text>{isLoading ? '로그인 중...' : '로그인'}</Text>
      </Button>
    </SafeAreaView>
  );
};
