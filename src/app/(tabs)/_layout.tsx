import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs>
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
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>설정</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="settings" sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
