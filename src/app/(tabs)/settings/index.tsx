import { Link } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import packageJson from '@/../package.json';
import { Button } from '@/components/primitives/Button';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
import { SsurfLined } from '@/icons/SsurfLined';
import { REV } from '@/index';

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: theme.gap(2),
    width: '100%',
    position: 'relative',
    backgroundColor: theme.colors.surface,
    padding: theme.gap(2),
  },
  titleContainer: { display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' },
}));

export default function Index() {
  const { logout } = useRusaintSession();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <SsurfLined height={32} width={32} />
        <ThemedText typography="heading3xl">설정</ThemedText>
      </View>
      <View style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
        <View style={{ display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' }}>
          <SsurfLined height={64} width={64} />
          <ThemedText typography="headingLg">
            SSURF v{packageJson.version} (rev. {REV})
          </ThemedText>
        </View>
        <ThemedText typography="bodyLg">
          Copyright © 2025 EATSTEAK, fecapark and SSURF Contributors.
        </ThemedText>
        <ThemedText typography="bodyLg">
          This Project is hosted on{' '}
          <Link asChild href="https://github.com/eatsteak/ssurf">
            <ThemedText color="primaryInverted" typography="bodyLg">
              GitHub
            </ThemedText>
          </Link>
          .
        </ThemedText>
        <ThemedText typography="bodyLg">
          Based on Open-source u-saint scraper{' '}
          <Link asChild href="https://github.com/eatsteak/rusaint">
            <ThemedText color="primaryInverted" typography="bodyLg">
              rusaint
            </ThemedText>
          </Link>
          .
        </ThemedText>
      </View>
      <Button onPress={logout}>로그아웃</Button>
    </SafeAreaView>
  );
}
