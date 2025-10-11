import { SemesterType } from '@rusaint/react-native';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
import { useGeneralChapelInformation } from '@/hooks/chapel/chapel';

export default function Index() {
  const { login, logout, session } = useRusaintSession();
  const { data } = useGeneralChapelInformation(2025, SemesterType.Two);

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
          <Text>{JSON.stringify(data)}</Text>
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
