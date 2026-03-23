import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ChevronRightIcon, IconProps } from '@/shared/ui/icons';

const styles = StyleSheet.create({
  root: (expanded: boolean) => ({
    transform: [{ rotate: expanded ? '90deg' : '0deg' }],
  }),
});

export interface ChevronRightToggleIconProps extends Omit<
  IconProps,
  'materialName' | 'symbolName'
> {
  expanded: boolean;
}

export function ChevronRightToggleIcon({ expanded, ...props }: ChevronRightToggleIconProps) {
  return (
    <View style={styles.root(expanded)}>
      <ChevronRightIcon {...props} />
    </View>
  );
}
