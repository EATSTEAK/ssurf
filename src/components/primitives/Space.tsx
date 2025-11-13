import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  space: (gap: number) => ({
    variants: {
      direction: {
        vertical: { height: theme.gap(gap) },
        horizontal: { width: theme.gap(gap) },
      },
    },
  }),
}));

export const Space = ({
  direction = 'vertical',
  gap,
}: {
  direction?: 'horizontal' | 'vertical';
  gap: number;
}) => {
  styles.useVariants({ direction });
  return <View style={styles.space(gap)} />;
};
