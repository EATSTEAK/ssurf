import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useUnistyles } from 'react-native-unistyles';

export default function TabsLayout() {
  const { theme } = useUnistyles();
  return (
    <NativeTabs backgroundColor={theme.colors.surfaceDim} tintColor={theme.colors.primary}>
      <NativeTabs.Trigger name="feed">
        <NativeTabs.Trigger.Label>피드</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="newspaper" sf="newspaper.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Label>시간표</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="calendar_clock" sf="calendar" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chapel">
        <NativeTabs.Trigger.Label>채플</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="church" sf="bird.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grades">
        <NativeTabs.Trigger.Label>성적</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="school" sf="graduationcap.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>더보기</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="more_horiz" sf="ellipsis" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
