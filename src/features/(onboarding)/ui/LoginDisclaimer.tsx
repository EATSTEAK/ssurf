import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { LockIcon } from '@/shared/ui/icons';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { Wave } from '@/shared/ui/Wave';

const styles = StyleSheet.create((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.gap(3),
    gap: theme.gap(1.5),
  },
  waveContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: '100%',
    height: 20,
    backgroundColor: theme.colors.primary,
    transform: [{ rotate: '180deg' }],
  },
  wave: {
    height: 20,
    width: '100%',
  },
}));

const ThemedLockIcon = withUnistyles(LockIcon, (theme) => ({
  color: theme.colorsHex.fgSurface,
}));
const UnistylesSafeAreaView = withUnistyles(SafeAreaView);

export const LoginDisclaimer = () => {
  return (
    <UnistylesSafeAreaView edges={{ bottom: 'additive' }} style={styles.root}>
      <View style={styles.waveContainer}>
        <Wave color="surface" style={styles.wave} />
      </View>
      <ThemedLockIcon />
      <ThemedText typography="headingMd">로그인 정보는 기기에만 저장돼요.</ThemedText>
      <ThemedText typography="bodySm">SSURF는 여러분의 어떤 정보도 열람할 수 없어요.</ThemedText>
    </UnistylesSafeAreaView>
  );
};
