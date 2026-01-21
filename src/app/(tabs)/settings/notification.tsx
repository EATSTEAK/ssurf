import { useRouter } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useNotificationPermission } from '@/features/notifications/lib/useNotificationPermission';
import { useNotificationSettings } from '@/features/notifications/lib/useNotificationSettings';
import { CardView } from '@/shared/ui/containers/CardView';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Icon } from '@/shared/ui/icons';
import { ActionItemWithSwitch, ActionList } from '@/shared/ui/primitives/ActionList';
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
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  backButton: {
    padding: theme.gap(0.5),
    marginLeft: -theme.gap(0.5),
  },
  actionListSymbol: {
    color: rt.colorScheme === 'dark' ? paletteHex.sand200 : paletteHex.sand800,
  },
  infoText: {
    paddingHorizontal: theme.gap(3),
    paddingBottom: theme.gap(2),
    color: rt.colorScheme === 'dark' ? paletteHex.sand400 : paletteHex.sand600,
  },
  permissionWarning: {
    paddingHorizontal: theme.gap(3),
    paddingBottom: theme.gap(2),
    color: paletteHex.coral600,
  },
}));

export default function NotificationSettings() {
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const { hasPermission, requestPermission } = useNotificationPermission();
  const { settings, toggleEnabled, updateChapelSettings, updateGradeSettings } =
    useNotificationSettings();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 전체 알림이 비활성화되면 하위 토글들도 비활성화
  const isSubSettingsDisabled = !settings.enabled;

  const handleMasterToggle = async (value: boolean) => {
    if (value && hasPermission === false) {
      // 알림을 켜려고 하는데 권한이 없으면 권한 요청
      const granted = await requestPermission();
      if (!granted) {
        return; // 권한이 거부되면 토글하지 않음
      }
    }
    toggleEnabled(value);
  };

  return (
    <View style={styles.root}>
      <RefreshableScrollView
        onScroll={scrollHandler}
        refreshing={false}
        scrollEventThrottle={16}
      >
        <SafeContainer>
          {Platform.OS === 'ios' && <Space gap={2} />}
          <View style={styles.topView}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Icon
                  color={styles.actionListSymbol.color}
                  materialName="chevron-left"
                  size={28}
                  symbolName="chevron.left"
                />
              </Pressable>
              <ThemedText typography="headingXl">알림 설정</ThemedText>
            </View>
          </View>

          {hasPermission === false && (
            <ThemedText style={styles.permissionWarning} typography="bodySm">
              알림 권한이 비활성화되어 있습니다. 알림을 받으려면 설정에서 권한을 허용해주세요.
            </ThemedText>
          )}

          <CardView>
            <ThemedText typography="headingLg">전체 알림</ThemedText>
            <ActionList>
              <ActionItemWithSwitch
                icon={
                  <Icon
                    color={styles.actionListSymbol.color}
                    materialName="bell"
                    size={24}
                    symbolName="bell"
                  />
                }
                onValueChange={handleMasterToggle}
                title="알림 받기"
                value={settings.enabled}
              />
            </ActionList>
          </CardView>

          <CardView>
            <ThemedText typography="headingLg">성적 알림</ThemedText>
            <ActionList>
              <ActionItemWithSwitch
                description="과목별 성적이 변경되면 알림을 받습니다"
                disabled={isSubSettingsDisabled}
                icon={
                  <Icon
                    color={styles.actionListSymbol.color}
                    materialName="chart-bar"
                    size={24}
                    symbolName="chart.bar"
                  />
                }
                onValueChange={(value) => updateGradeSettings('classGrade', value)}
                title="과목별 성적 변경"
                value={settings.grades.classGrade}
              />
              <ActionItemWithSwitch
                description="학기별 성적이 업데이트되면 알림을 받습니다"
                disabled={isSubSettingsDisabled}
                icon={
                  <Icon
                    color={styles.actionListSymbol.color}
                    materialName="chart-line"
                    size={24}
                    symbolName="chart.line.uptrend.xyaxis"
                  />
                }
                onValueChange={(value) => updateGradeSettings('semesterGrade', value)}
                title="학기별 성적 업데이트"
                value={settings.grades.semesterGrade}
              />
            </ActionList>
          </CardView>

          <CardView>
            <ThemedText typography="headingLg">채플 알림</ThemedText>
            <ActionList>
              <ActionItemWithSwitch
                description="채플 출석 정보가 변경되면 알림을 받습니다"
                disabled={isSubSettingsDisabled}
                icon={
                  <Icon
                    color={styles.actionListSymbol.color}
                    materialName="bird"
                    size={24}
                    symbolName="bird"
                  />
                }
                onValueChange={(value) => updateChapelSettings('attendance', value)}
                title="출석 정보 변경"
                value={settings.chapel.attendance}
              />
            </ActionList>
          </CardView>

          <ThemedText style={styles.infoText} typography="bodySm">
            백그라운드에서 주기적으로 정보를 확인하여 변경 사항이 있을 때 알림을 발송합니다.
          </ThemedText>
        </SafeContainer>
      </RefreshableScrollView>
      <FloatingHeader scrollY={scrollY} title="알림 설정" />
    </View>
  );
}
