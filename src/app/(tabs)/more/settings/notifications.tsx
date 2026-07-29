import { Stack } from 'expo-router';
import { Platform, Switch, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useSetting } from '@/entities/settings/lib/queries';
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
    width: '100%',
    gap: theme.gap(1),
    flexDirection: 'column',
    padding: theme.gap(3),
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export default function NotificationSettingsScreen() {
  const scrollY = useSharedValue(0);
  const [courseGradeEnabled, setCourseGradeEnabled] = useSetting(
    'notifications.courseGrade.enabled',
  );
  const [semesterGradeEnabled, setSemesterGradeEnabled] = useSetting(
    'notifications.semesterGrade.enabled',
  );
  const [chapelEnabled, setChapelEnabled] = useSetting('notifications.chapel.enabled');
  const [noticeEnabled, setNoticeEnabled] = useSetting('notifications.notice.enabled');

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const options = [
    {
      key: 'course-grade',
      onValueChange: setCourseGradeEnabled,
      title: '과목별 성적 변경',
      value: courseGradeEnabled,
    },
    {
      key: 'semester-grade',
      onValueChange: setSemesterGradeEnabled,
      title: '학기별 성적 업데이트',
      value: semesterGradeEnabled,
    },
    {
      key: 'chapel',
      onValueChange: setChapelEnabled,
      title: '채플 출석 정보 변경',
      value: chapelEnabled,
    },
    {
      key: 'notice',
      onValueChange: setNoticeEnabled,
      title: '공지 업데이트',
      value: noticeEnabled,
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '알림 설정',
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
              <Header title="알림 설정" />
              <ThemedText color="fgSecondary" typography="labelMd">
                받을 알림을 선택하세요
              </ThemedText>
            </View>
            <CardView>
              <ActionList>
                {options.map((option) => (
                  <ActionListItem
                    accessibilityLabel={option.title}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: option.value }}
                    icon={null}
                    key={option.key}
                    onPress={() => void option.onValueChange(!option.value)}
                  >
                    <View style={styles.itemContent}>
                      <ThemedText typography="bodyLg">{option.title}</ThemedText>
                      <Switch accessible={false} pointerEvents="none" value={option.value} />
                    </View>
                  </ActionListItem>
                ))}
              </ActionList>
            </CardView>
          </SafeContainer>
        </Animated.ScrollView>
        <FloatingHeader scrollY={scrollY} title="알림 설정" />
      </View>
    </>
  );
}
