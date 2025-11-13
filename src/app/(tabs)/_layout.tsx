import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { RusaintApplicationProvider } from '@/components/providers/RusaintApplicationProvider';
import { RusaintSessionProvider } from '@/components/providers/RusaintSessionProvider';

export default function TabsLayout() {
  return (
    <RusaintSessionProvider>
      <RusaintApplicationProvider>
        <NativeTabs>
          <NativeTabs.Trigger name="(tabs)/chapel">
            <Label>채플</Label>
            {Platform.select({
              ios: <Icon sf="bird.fill" />,
              android: <VectorIcon family={MaterialCommunityIcons} name="bird" />,
            })}
          </NativeTabs.Trigger>
        </NativeTabs>
      </RusaintApplicationProvider>
    </RusaintSessionProvider>
  );
}
