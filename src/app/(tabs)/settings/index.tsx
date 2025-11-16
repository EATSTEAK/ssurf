import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, RefreshControl, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import packageJson from '@/../package.json';
import { ActionList, ActionListItem } from '@/components/primitives/ActionList';
import { ThemedText } from '@/components/primitives/ThemedText';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
import { RefreshHeader } from '@/components/RefreshHeader';
import { useStudentInformation } from '@/hooks/studentInformation/studentInformation';
import { useSyncStudentInformation } from '@/hooks/sync/useSyncStudentInformation';
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
  },
  scrollView: {
    gap: theme.gap(2),
    backgroundColor: theme.colors.surface,
  },
  headerView: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.gap(2),
  },
  profileView: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.gap(2),
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
    color: theme.colors.fgPrimary,
  },
  cardView: {
    backgroundColor: theme.colors.surfaceDim,
    padding: theme.gap(2),
    gap: theme.gap(2),
  },
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
    <View style={{ flex: 1, position: 'relative' }}>
      <SafeAreaView style={styles.container}>
        <AnimatedScrollView
          contentContainerStyle={styles.scrollView}
          onScroll={scrollHandler}
          refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isSyncing} />}
          scrollEventThrottle={16}
        >
          <View style={styles.headerView}>
            <SsurfLined height={32} width={32} />
            <ThemedText typography="heading3xl">설정</ThemedText>
          </View>
          {info && (
            <View style={styles.profileView}>
              <View style={styles.profileIcon}>
                {Platform.select({
                  ios: <SymbolView colors={styles.profileSymbol.color} name="person" size={32} />,
                  android: (
                    <MaterialCommunityIcons
                      color={styles.profileSymbol.color}
                      name="account"
                      size={32}
                    />
                  ),
                })}
              </View>
              <View>
                <ThemedText typography="headingXl">{info.name}</ThemedText>
                <ThemedText typography="bodyMd">
                  {info.studentNumber} / {info.department}
                </ThemedText>
              </View>
            </View>
          )}
          <View style={styles.cardView}>
            <ThemedText typography="headingLg">계정 설정</ThemedText>
            <ActionList>
              <ActionListItem
                icon={
                  <SymbolView
                    colors={styles.cardView.backgroundColor}
                    name="rectangle.portrait.and.arrow.right"
                    size={24}
                  />
                }
                onPress={logout}
              >
                <ThemedText typography="bodyLg">로그아웃</ThemedText>
              </ActionListItem>
            </ActionList>
          </View>
          <View style={styles.cardView}>
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
        </AnimatedScrollView>
      </SafeAreaView>
      <RefreshHeader isSyncing={isSyncing} pullDistance={pullDistance} />
    </View>
  );
}
