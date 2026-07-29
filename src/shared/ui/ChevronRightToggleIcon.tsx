import { View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { ChevronRightIcon, IconProps } from '@/shared/ui/icons';

const ThemedChevronRightIcon = withUnistyles(ChevronRightIcon);

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
  return (
    <View style={styles.root(expanded)}>
      <ThemedChevronRightIcon
        size={size}
        uniProps={(theme) => ({ color: color ?? theme.colorsHex.fgSurfaceMuted })}
        {...props}
      />
    </View>
  );
}
