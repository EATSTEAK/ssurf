import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ChevronRightIcon, IconProps } from '@/shared/ui/icons';

const styles = StyleSheet.create({
  root: (expanded: boolean) => ({
    transform: [{ rotate: expanded ? '90deg' : '0deg' }],
  }),
});

export interface ChevronRightToggleIconProps extends Omit<
  IconProps,
  'color' | 'materialName' | 'symbolName'
> {
  color?: string;
  expanded: boolean;
}

export function ChevronRightToggleIcon({
  color,
  expanded,
  size = 12,
  ...props
}: ChevronRightToggleIconProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.root(expanded)}>
      <ChevronRightIcon color={color ?? theme.colorsHex.fgSurfaceMuted} size={size} {...props} />
    </View>
  );
}
