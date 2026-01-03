import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useLoading } from 'react-simplikit';

import { useRusaintSession } from '@/shared/providers/RusaintSessionProvider';
import { SsurfLined } from '@/shared/ui/icons/SsurfLined';
import { Button } from '@/shared/ui/primitives/Button';
import { TextField } from '@/shared/ui/primitives/TextField';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  view: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: theme.gap(2),
    width: '100%',
    paddingHorizontal: theme.gap(4),
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(1),
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
    <SafeAreaView edges={{ top: 'additive' }} style={styles.view}>
      <View style={styles.header}>
        <SsurfLined color="surface" height={48} width={48} />
        <ThemedText typography="heading2xl">로그인</ThemedText>
        <ThemedText>숭실대학교 계정으로 로그인 할 수 있어요.</ThemedText>
      </View>
      <TextField onChangeText={setId} placeholder="학번" value={id} />
      <TextField
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
      />
      <Button
        disabled={isLoading || !id || !password}
        onPress={onPressLoginButton}
        style={{ width: '100%' }}
        variant="surface"
      >
        <Text>{isLoading ? '로그인 중...' : '로그인'}</Text>
      </Button>
    </SafeAreaView>
  );
};
