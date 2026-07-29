import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';
import { useLoading } from 'react-simplikit';

import { useRusaintSession } from '@/shared/providers/RusaintSessionProvider';
import { EyeIcon, EyeOffIcon } from '@/shared/ui/icons';
import { SsurfLined } from '@/shared/ui/icons/SsurfLined';
import { Button } from '@/shared/ui/primitives/Button';
import { TextField } from '@/shared/ui/primitives/TextField';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const normalizeLoginErrorMessage = (message: string) =>
  message.replace(
    /^RusaintError\.General:[\s\S]*?Token is not included in response:\s*([\s\S]*)$/,
    (_, detail: string) => detail.replaceAll('\\n', '\n').trim(),
  );

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
  passwordField: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const ThemedEyeIcon = withUnistyles(EyeIcon, (theme) => ({
  color: theme.colorsHex.fgPrimaryContainer,
}));
const ThemedEyeOffIcon = withUnistyles(EyeOffIcon, (theme) => ({
  color: theme.colorsHex.fgPrimaryContainer,
}));

export const LoginForm = () => {
  const { login } = useRusaintSession();
  const [isLoading, startLoading] = useLoading();

  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onPressLoginButton = async () => {
    try {
      await startLoading(login(id, password));
      router.replace('/(tabs)/chapel');
    } catch (error) {
      Alert.alert(
        '로그인 실패',
        error instanceof Error
          ? normalizeLoginErrorMessage(error.message)
          : '알 수 없는 오류가 발생했어요.',
      );
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
      <View style={styles.passwordField}>
        <TextField
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry={!isPasswordVisible}
          style={styles.passwordInput}
          value={password}
        />
        <Pressable
          accessibilityLabel={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
          accessibilityRole="button"
          onPress={() => setIsPasswordVisible((visible) => !visible)}
          style={styles.passwordToggle}
        >
          {isPasswordVisible ? <ThemedEyeOffIcon /> : <ThemedEyeIcon />}
        </Pressable>
      </View>
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
