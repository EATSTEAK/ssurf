import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { RefreshControl, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import packageJson from '@/../package.json';
import { FloatingHeader } from '@/components/FloatingHeader';
import { ActionList, ActionListItem } from '@/components/primitives/ActionList';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
import { RefreshHeader } from '@/components/RefreshHeader';
import { useStudentInformation } from '@/hooks/studentInformation/studentInformation';
import { useSyncStudentInformation } from '@/hooks/sync/useSyncStudentInformation';
import { SsurfLined } from '@/icons/SsurfLined';
import { REV } from '@/index';
import { paletteHex } from '@/unistyles';

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  scrollView: {
    gap: theme.gap(2),
    backgroundColor: theme.colors.surface,
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    gap: theme.gap(2),
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
  topView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(3),
    flexDirection: 'column',
    padding: theme.gap(3),
  },
  headerView: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileView: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.cornerRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSymbol: {
    color: rt.colorScheme === 'dark' ? paletteHex.sand50 : paletteHex.sand950,
  },
  actionListSymbol: {
    color: rt.colorScheme === 'dark' ? paletteHex.sand200 : paletteHex.sand800,
  },
  cardView: {
    backgroundColor: theme.colors.surfaceDim,
    padding: theme.gap(3),
    gap: theme.gap(2),
  },
  infoView: { display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' },
}));

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function Index() {
  const { logout } = useRusaintSession();
  const { sync, isSyncing } = useSyncStudentInformation();
  const { data: info } = useStudentInformation();
  const scrollY = useSharedValue(0);
  const pullDistance = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      if (event.contentOffset.y < 0 && !isSyncing) {
        pullDistance.value = Math.abs(event.contentOffset.y);
      } else if (event.contentOffset.y >= 0) {
        pullDistance.value = 0;
      }
    },
    onEndDrag: () => {
      pullDistance.value = withSpring(0);
    },
  });

  const onRefresh = async () => {
    await sync([], { force: true });
  };
  return (
    <View style={styles.root}>
      <AnimatedScrollView
        contentContainerStyle={styles.scrollView}
        onScroll={scrollHandler}
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isSyncing} />}
        scrollEventThrottle={16}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.topView}>
            <View style={styles.headerView}>
              <SsurfLined height={32} width={32} />
              <ThemedText typography="heading3xl">설정</ThemedText>
            </View>
            {info && (
              <View style={styles.profileView}>
                <View style={styles.profileIcon}>
                  <SymbolView
                    fallback={
                      <MaterialCommunityIcons
                        color={styles.profileSymbol.color}
                        name="account"
                        size={32}
                      />
                    }
                    name="person"
                    size={32}
                    tintColor={styles.profileSymbol.color}
                  />
                </View>
                <View>
                  <ThemedText typography="headingXl">{info.name}</ThemedText>
                  <ThemedText typography="bodyMd">
                    {info.studentNumber} / {info.department}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
          <View style={styles.cardView}>
            <ThemedText typography="headingLg">계정 설정</ThemedText>
            <ActionList>
              <ActionListItem
                icon={
                  <SymbolView
                    fallback={
                      <MaterialCommunityIcons
                        color={styles.actionListSymbol.color}
                        name="logout"
                        size={24}
                      />
                    }
                    name="rectangle.portrait.and.arrow.right"
                    size={24}
                    tintColor={styles.actionListSymbol.color}
                  />
                }
                onPress={logout}
              >
                <ThemedText typography="bodyLg">로그아웃</ThemedText>
              </ActionListItem>
            </ActionList>
          </View>
          <View style={styles.cardView}>
            <View style={styles.infoView}>
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
        </SafeAreaView>
      </AnimatedScrollView>
      <FloatingHeader scrollY={scrollY} title="설정" />
      <RefreshHeader isSyncing={isSyncing} pullDistance={pullDistance} />
    </View>
  );
}
