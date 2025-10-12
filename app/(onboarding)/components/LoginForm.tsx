import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';

export const LoginForm = () => {
  const { login } = useRusaintSession();

  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const onPressLoginButton = async () => {
    await login(id, password);
  };

  return (
    <View
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        paddingHorizontal: 32,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
        }}
      >
        유세인트 로그인
      </Text>

      <TextInput onChangeText={setId} placeholder="학번" style={styles.textInput} value={id} />
      <TextInput
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        style={styles.textInput}
        value={password}
      />

      <Text style={styles.information}>학번 및 비밀번호는 사용자 기기에만 저장돼요.</Text>

      <Pressable onPress={onPressLoginButton} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </Pressable>
    </View>
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
    color: '#666',
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
