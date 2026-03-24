import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

export default function TabsLayout() {
  const { theme } = useUnistyles();
  return (
    <NativeTabs backgroundColor={theme.colors.surfaceDim} tintColor={theme.colors.primary}>
      <NativeTabs.Trigger name="feed">
        <Label>피드</Label>
        {Platform.select({
          ios: <Icon sf="newspaper.fill" />,
          android: <Icon src={<VectorIcon family={MaterialCommunityIcons} name="newspaper" />} />,
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <Label>시간표</Label>
        {Platform.select({
          ios: <Icon sf="calendar" />,
          android: (
            <Icon src={<VectorIcon family={MaterialCommunityIcons} name="calendar-clock" />} />
          ),
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chapel">
        <Label>채플</Label>
        {Platform.select({
          ios: <Icon sf="bird.fill" />,
          android: <Icon src={<VectorIcon family={MaterialCommunityIcons} name="bird" />} />,
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grades">
        <Label>성적</Label>
        {Platform.select({
          ios: <Icon sf="graduationcap.fill" />,
          android: <Icon src={<VectorIcon family={MaterialCommunityIcons} name="school" />} />,
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>설정</Label>
        {Platform.select({
          ios: <Icon sf="gearshape.fill" />,
          android: <Icon src={<VectorIcon family={MaterialCommunityIcons} name="cog" />} />,
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
