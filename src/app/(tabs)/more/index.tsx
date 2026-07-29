import Constants from 'expo-constants';
import { Link, router, Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { useStudentInformation } from '@/entities/studentInformation/lib/queries';
import { LogoutModal } from '@/features/auth/ui/LogoutModal';
import { UserProfile } from '@/features/settings/ui/UserProfile';
import { useRusaintSession } from '@/shared/providers/RusaintSessionProvider';
import { CardView } from '@/shared/ui/containers/CardView';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { BellIcon, LogoutIcon, NewspaperIcon, SettingsIcon } from '@/shared/ui/icons';
import { SsurfLined } from '@/shared/ui/icons/SsurfLined';
import { ActionList, ActionListItem } from '@/shared/ui/primitives/ActionList';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  topView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(3),
    flexDirection: 'column',
    padding: theme.gap(3),
  },
  infoView: { display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' },
}));

const ThemedBellIcon = withUnistyles(BellIcon, (theme) => ({
  color: theme.colorsHex.fgSurfaceDimmer,
}));
const ThemedLogoutIcon = withUnistyles(LogoutIcon, (theme) => ({
  color: theme.colorsHex.fgSurfaceDimmer,
}));
const ThemedNewspaperIcon = withUnistyles(NewspaperIcon, (theme) => ({
  color: theme.colorsHex.fgSurfaceDimmer,
}));
const ThemedSettingsIcon = withUnistyles(SettingsIcon, (theme) => ({
  color: theme.colorsHex.fgSurfaceDimmer,
}));

export default function Index() {
  const { logout } = useRusaintSession();
  const { data: info, isSyncing, refresh } = useStudentInformation();
  const scrollY = useSharedValue(0);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [revisionPressCount, setRevisionPressCount] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = async () => {
    await refresh();
  };
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '더보기',
          headerTitle: () => <></>,
        }}
      />
      <View style={styles.root}>
        <RefreshableScrollView
          onRefresh={onRefresh}
          onScroll={scrollHandler}
          refreshing={isSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="더보기" />
              {info && <UserProfile info={info} />}
            </View>
            <CardView>
              <ThemedText typography="headingLg">설정</ThemedText>
              <ActionList>
                <ActionListItem
                  icon={<ThemedNewspaperIcon size={24} />}
                  onPress={() => router.push('/more/settings/feed')}
                >
                  <ThemedText typography="bodyLg">피드 설정</ThemedText>
                </ActionListItem>
                <ActionListItem
                  icon={<ThemedBellIcon size={24} />}
                  onPress={() => router.push('/more/settings/notifications')}
                >
                  <ThemedText typography="bodyLg">알림 설정</ThemedText>
                </ActionListItem>
                {revisionPressCount >= 5 && (
                  <ActionListItem
                    icon={<ThemedSettingsIcon size={24} />}
                    onPress={() => router.push('./developer', { relativeToDirectory: true })}
                  >
                    <ThemedText typography="bodyLg">개발자 메뉴</ThemedText>
                  </ActionListItem>
                )}
                <ActionListItem
                  icon={<ThemedLogoutIcon size={24} />}
                  onPress={() => setIsLogoutModalVisible(true)}
                >
                  <ThemedText typography="bodyLg">로그아웃</ThemedText>
                </ActionListItem>
              </ActionList>
            </CardView>
            <CardView>
              <View style={styles.infoView}>
                <SsurfLined height={64} width={64} />
                <ThemedText typography="headingLg">
                  SSURF v{Constants.expoConfig?.version}
                </ThemedText>
              </View>
              <ThemedText typography="bodyLg">
                Copyright © 2026 EATSTEAK and SSURF Contributors.
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
              <Pressable
                accessibilityLabel="리비전"
                accessibilityRole="button"
                onPress={() => setRevisionPressCount((count) => Math.min(count + 1, 5))}
              >
                <ThemedText style={{ textAlign: 'right' }} typography="labelSm">
                  rev.{' '}
                  {Constants.expoConfig?.android?.versionCode ??
                    Constants.expoConfig?.ios?.buildNumber}
                </ThemedText>
              </Pressable>
            </CardView>
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader scrollY={scrollY} title="더보기" />
        <LogoutModal
          onClose={() => setIsLogoutModalVisible(false)}
          onLogout={logout}
          visible={isLogoutModalVisible}
        />
      </View>
    </>
  );
}
