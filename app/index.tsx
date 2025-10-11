import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';

export default function Index() {
  const {
    login,
    logout,
    user: { session, id: userId, password: userPassword },
  } = useRusaintSession();

  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const onLogin = async () => {
    await login(id, password);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {session ? (
        <>
          <Text>{userId}</Text>
          <Text>{userPassword}</Text>
          <Text>{JSON.stringify(session)}</Text>
          <Button onPress={() => logout()} title="logout" />
        </>
      ) : (
        <>
          <TextInput onChangeText={setId} placeholder="아무거나 입력하세요..." value={id} />
          <TextInput
            onChangeText={setPassword}
            placeholder="아무거나 입력하세요..!"
            secureTextEntry
            value={password}
          />
          <Button onPress={onLogin} title="login" />
        </>
      )}
    </View>
  );
}
