import { Stack } from 'expo-router';
import { Alert, Platform, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useRusaintSession } from '@/shared/providers/RusaintSessionProvider';
import { CardView } from '@/shared/ui/containers/CardView';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { ActionList, ActionListItem } from '@/shared/ui/primitives/ActionList';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: theme.gap(8),
  },
  topView: {
    gap: theme.gap(1),
    padding: theme.gap(3),
  },
}));

export default function DeveloperSettingsScreen() {
  const { resetOnboarding } = useRusaintSession();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onResetOnboarding = () => {
    Alert.alert('온보딩 초기화', '현재 계정의 온보딩을 다시 진행할까요?', [
      { style: 'cancel', text: '취소' },
      {
        onPress: () => {
          void resetOnboarding().catch((error) => {
            console.error('Failed to reset onboarding:', error);
            Alert.alert('온보딩 초기화 실패', '잠시 후 다시 시도해 주세요.');
          });
        },
        style: 'destructive',
        text: '초기화',
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '개발자 메뉴',
          headerTitle: () => <></>,
        }}
      />
      <View style={styles.root}>
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="개발자 메뉴" />
              <ThemedText color="fgSecondary" typography="labelMd">
                개발 및 테스트용 기능을 관리해요
              </ThemedText>
            </View>
            <CardView>
              <ThemedText typography="headingLg">온보딩</ThemedText>
              <ActionList>
                <ActionListItem
                  accessibilityHint="현재 계정의 온보딩 완료 상태를 초기화합니다"
                  accessibilityLabel="온보딩 상태 초기화"
                  icon={null}
                  onPress={onResetOnboarding}
                >
                  <ThemedText typography="bodyLg">온보딩 상태 초기화</ThemedText>
                </ActionListItem>
              </ActionList>
            </CardView>
          </SafeContainer>
        </Animated.ScrollView>
        <FloatingHeader scrollY={scrollY} title="개발자 메뉴" />
      </View>
    </>
  );
}
