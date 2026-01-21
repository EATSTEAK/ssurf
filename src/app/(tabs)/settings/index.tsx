import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useStudentInformation } from '@/entities/studentInformation/lib/queries';
import { useSyncStudentInformation } from '@/entities/studentInformation/lib/sync';
import { LogoutModal } from '@/features/auth/ui/LogoutModal';
import { UserProfile } from '@/features/settings/ui/UserProfile';
import { useRusaintSession } from '@/shared/providers/RusaintSessionProvider';
import { CardView } from '@/shared/ui/containers/CardView';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { ChevronRightIcon, Icon, LogoutIcon } from '@/shared/ui/icons';
import { SsurfLined } from '@/shared/ui/icons/SsurfLined';
import { ActionList, ActionListItem } from '@/shared/ui/primitives/ActionList';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { paletteHex } from '@/unistyles';

const styles = StyleSheet.create((theme, rt) => ({
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
  actionListSymbol: {
    color: rt.colorScheme === 'dark' ? paletteHex.sand200 : paletteHex.sand800,
  },
  infoView: { display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' },
  actionItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export default function SettingsIndex() {
  const { logout } = useRusaintSession();
  const { sync, isSyncing } = useSyncStudentInformation();
  const { data: info } = useStudentInformation();
  const scrollY = useSharedValue(0);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const router = useRouter();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = async () => {
    await sync([], { force: true });
  };

  return (
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
            <Header title="설정" />
            {info && <UserProfile info={info} />}
          </View>
          <CardView>
            <ThemedText typography="headingLg">알림</ThemedText>
            <ActionList>
              <ActionListItem
                icon={
                  <Icon
                    color={styles.actionListSymbol.color}
                    materialName="bell"
                    size={24}
                    symbolName="bell"
                  />
                }
                onPress={() => router.push('./notification')}
              >
                <View style={styles.actionItemContent}>
                  <ThemedText typography="bodyLg">알림 설정</ThemedText>
                  <ChevronRightIcon color={styles.actionListSymbol.color} size={20} />
                </View>
              </ActionListItem>
            </ActionList>
          </CardView>
          <CardView>
            <ThemedText typography="headingLg">계정 설정</ThemedText>
            <ActionList>
              <ActionListItem
                icon={<LogoutIcon color={styles.actionListSymbol.color} size={24} />}
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
                SSURF v{Constants.expoConfig?.version} (rev.{' '}
                {Constants.expoConfig?.android?.versionCode ??
                  Constants.expoConfig?.ios?.buildNumber}
                )
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
          </CardView>
        </SafeContainer>
      </RefreshableScrollView>
      <FloatingHeader scrollY={scrollY} title="설정" />
      <LogoutModal
        onClose={() => setIsLogoutModalVisible(false)}
        onLogout={logout}
        visible={isLogoutModalVisible}
      />
    </View>
  );
}
