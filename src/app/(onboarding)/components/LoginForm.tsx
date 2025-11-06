import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoading } from 'react-simplikit';

import { Button } from '@/components/primitives/Button';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';

export const LoginForm = () => {
  const { login } = useRusaintSession();
  const [isLoading, startLoading] = useLoading();

  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const onPressLoginButton = async () => {
    await startLoading(login(id, password));
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        paddingHorizontal: 32,
      }}
    >
      <ThemedText color="surface" typography="heading2xl">
        유세인트 로그인
      </ThemedText>

      <TextInput onChangeText={setId} placeholder="학번" style={styles.textInput} value={id} />
      <TextInput
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        style={styles.textInput}
        value={password}
      />

      <ThemedText color="secondary" typography="labelSm">
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

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 0,
    paddingHorizontal: 16,
    width: '100%',
    height: 48,
  },
  information: {
    fontSize: 13,
    textAlign: 'center',
  },
});
