import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="feed">
        <NativeTabs.Trigger.Label>피드</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="newspaper.fill" md="newspaper" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Label>시간표</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_clock" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chapel">
        <NativeTabs.Trigger.Label>채플</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bird.fill" md="church" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grades">
        <NativeTabs.Trigger.Label>성적</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="graduationcap.fill" md="school" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>설정</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
