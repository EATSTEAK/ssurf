import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="chapel/index">
        <Label>채플</Label>
        {Platform.select({
          ios: <Icon sf="bird.fill" />,
          android: <VectorIcon family={MaterialCommunityIcons} name="bird" />,
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
