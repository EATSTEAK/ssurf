import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

export default function TabsLayout() {
  const { theme } = useUnistyles();
  return (
    <NativeTabs tintColor={theme.colors.primary}>
      <NativeTabs.Trigger name="chapel/index">
        <Label>채플</Label>
        {Platform.select({
          ios: <Icon sf="bird.fill" />,
          android: <VectorIcon family={MaterialCommunityIcons} name="bird" />,
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings/index">
        <Label>설정</Label>
        {Platform.select({
          ios: <Icon sf="gearshape.fill" />,
          android: <VectorIcon family={MaterialCommunityIcons} name="cog-outline" />,
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
