import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import loadingImage from '@/assets/loading.png';
import { enableBackgroundUpdates } from '@/shared/lib/backgroundUpdates';
import { SsurfLined } from '@/shared/ui/icons/SsurfLined';
import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { Wave } from '@/shared/ui/Wave';

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  waveContainer: {
    height: 10,
    transform: [{ rotate: '180deg' }],
  },
  surface: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flexGrow: 1,
    gap: theme.gap(1.5),
    padding: theme.gap(3),
  },
  header: {
    alignItems: 'flex-start',
    gap: theme.gap(1),
  },
  body: {
    flexGrow: 1,
    gap: theme.gap(2),
    paddingVertical: theme.gap(3),
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(1),
  },
  featureText: {
    flex: 1,
    gap: 1,
  },
  permissionSection: {
    gap: theme.gap(1),
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(0.5),
  },
  bulletText: {
    flex: 1,
  },
  button: {
    height: 44,
  },
  buttonText: {
    ...theme.typography.heading.md,
  },
  doneBody: {
    alignItems: 'center',
    flexGrow: 1,
    gap: theme.gap(1),
    paddingVertical: theme.gap(3),
  },
  loadingImage: {
    width: 294,
    height: 237.2,
  },
  centeredText: {
    textAlign: 'center',
  },
  legalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth: 289,
  },
}));

const UnistylesSafeAreaView = withUnistyles(SafeAreaView);

const SurfaceStep = ({ children }: PropsWithChildren) => (
  <View style={styles.root}>
    <SafeAreaView edges={['top']} />
    <View style={styles.waveContainer}>
      <Wave color="surface" height={10} width="100%" />
    </View>
    <UnistylesSafeAreaView edges={['bottom']} style={styles.surface}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </UnistylesSafeAreaView>
  </View>
);

const FeatureRow = ({ description, title }: { description: string; title: string }) => (
  <View style={styles.featureRow}>
    <SsurfLined color="primary" height={48} width={48} />
    <View style={styles.featureText}>
      <ThemedText typography="headingMd">{title}</ThemedText>
      <ThemedText typography="bodyMd">{description}</ThemedText>
    </View>
  </View>
);

const Header = ({ subtitle, title }: { subtitle: string; title: string }) => (
  <View style={styles.header}>
    <SsurfLined color="primary" height={48} width={48} />
    <ThemedText color="fgPrimary" typography="heading2xl">
      {title}
    </ThemedText>
    <ThemedText color="fgPrimary" typography="labelLg">
      {subtitle}
    </ThemedText>
  </View>
);

export function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <SurfaceStep>
      <Header
        subtitle={'SSURF는 숭실대학교 학교 생활의\n모든 정보를 제공하는 앱이에요.'}
        title="SSURF 사용을 환영해요!"
      />
      <View style={styles.body}>
        <ThemedText typography="headingLg">주요 기능</ThemedText>
        <FeatureRow
          description="내 성적부터 졸업까지 남은 학점과 요건을 한눈에 볼 수 있어요. 성적이 입력되었을 경우 알림도 보내줘요."
          title="성적 열람"
        />
        <FeatureRow
          description="u-saint / LMS 와 연동되어 내 시간표 및 학기별 과목 정보, 강의계획서를 볼 수 있어요."
          title="시간표 및 과목 정보 확인"
        />
        <FeatureRow
          description="숭실대학교 교내 대부분의 사이트의 공지사항 및 학사일정을 확인하고, 업데이트 알림을 받을 수 있어요."
          title="공지사항 및 일정"
        />
        <FeatureRow
          description="내 채플 출석 여부와 좌석 위치, PASS 여부를 바로 확인할 수 있어요."
          title="채플 출석 및 좌석 확인"
        />
      </View>
      <Button onPress={onNext} style={styles.button} textStyle={styles.buttonText}>
        다음
      </Button>
    </SurfaceStep>
  );
}

export function PermissionsStep({ onNext, studentId }: { onNext: () => void; studentId: string }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    void Notifications.getPermissionsAsync()
      .then((permission) => setNotificationsEnabled(permission.granted))
      .catch((error) => console.error('Failed to check notification permission:', error));
  }, []);

  const onPressLmsLogin = () => {
    Alert.alert('LMS 로그인', 'LMS 로그인 플로우는 준비 중이에요.');
  };

  const onPressNotifications = async () => {
    try {
      const enabled = await enableBackgroundUpdates(studentId, true);
      setNotificationsEnabled(enabled);
      if (!enabled) {
        Alert.alert('알림이 비활성화되어 있어요.', '기기 설정에서 알림을 허용할 수 있어요.');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      Alert.alert('알림 설정 실패', '잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <SurfaceStep>
      <Header
        subtitle="원활한 SSURF 사용을 위해, 아래 권한을 허용해 주세요."
        title="사용 전 확인할 것이 있어요"
      />
      <View style={styles.body}>
        <ThemedText typography="headingLg">선택 권한</ThemedText>
        <View style={styles.permissionSection}>
          <ThemedText typography="headingMd">LMS 로그인</ThemedText>
          <ThemedText typography="bodyMd">
            LMS와 연동하여 과제 마감일, 학습 컨텐츠 확인 및 알림 기능을 지원하기 위해 LMS 토큰을
            생성해요.
          </ThemedText>
          <View>
            <View style={styles.bulletRow}>
              <ThemedText typography="bodySm">•</ThemedText>
              <ThemedText style={styles.bulletText} typography="bodySm">
                토큰 생성 알림이 발생할 수 있어요.
              </ThemedText>
            </View>
            <View style={styles.bulletRow}>
              <ThemedText typography="bodySm">•</ThemedText>
              <ThemedText style={styles.bulletText} typography="bodySm">
                로그인 하지 않으면 과제 등 LMS 관련 정보를 제공받을 수 없어요.
              </ThemedText>
            </View>
          </View>
          <Button
            onPress={onPressLmsLogin}
            style={styles.button}
            textStyle={styles.buttonText}
            variant="success"
          >
            로그인
          </Button>
        </View>
        <View style={styles.permissionSection}>
          <ThemedText typography="headingMd">알림</ThemedText>
          <ThemedText typography="bodyMd">
            성적 입력, 과제, 공지 등 알림을 전달하기 위한 권한 허용이 필요해요.
          </ThemedText>
          <View>
            <View style={styles.bulletRow}>
              <ThemedText typography="bodySm">•</ThemedText>
              <ThemedText style={styles.bulletText} typography="bodySm">
                허용하지 않으면 알림이 비활성화 돼요.
              </ThemedText>
            </View>
            <View style={styles.bulletRow}>
              <ThemedText typography="bodySm">•</ThemedText>
              <ThemedText style={styles.bulletText} typography="bodySm">
                지금 허용하지 않더라도 더 보기 &gt; 알림 설정에서 설정할 수 있어요.
              </ThemedText>
            </View>
          </View>
          <Button
            accessibilityState={{ disabled: notificationsEnabled }}
            disabled={notificationsEnabled}
            onPress={onPressNotifications}
            style={styles.button}
            textStyle={styles.buttonText}
            variant="success"
          >
            {notificationsEnabled ? '완료됨' : '알림 허용'}
          </Button>
        </View>
      </View>
      <Button onPress={onNext} style={styles.button} textStyle={styles.buttonText}>
        다음
      </Button>
    </SurfaceStep>
  );
}

export function DoneStep({ onStart }: { onStart: () => void }) {
  return (
    <SurfaceStep>
      <Header subtitle="모든 준비가 완료되었어요. 신나게 SSURF해 봐요!" title="Let’s SSURF!" />
      <View style={styles.doneBody}>
        <Image contentFit="contain" source={loadingImage} style={styles.loadingImage} />
        <ThemedText style={styles.centeredText} typography="bodyMd">
          {'SSURF는 개인이 개발하는 오픈소스 앱이에요.\nGitHub에서 기여하실 수 있어요!'}
        </ThemedText>
        <View style={styles.legalContainer}>
          <ThemedText style={styles.centeredText} typography="bodySm">
            {
              'SSURF는 숭실대학교와 어떠한 공식적인 관련이 없으며, SSURF에서 제공되는 정보는 단순 참고용이에요.\n\nSSURF에서 제공하는 정보로 인해 발생할 수 있는 문제에 대해서 SSURF는 책임지지 않아요.'
            }
          </ThemedText>
        </View>
      </View>
      <Button onPress={onStart} style={styles.button} textStyle={styles.buttonText}>
        시작
      </Button>
    </SurfaceStep>
  );
}
