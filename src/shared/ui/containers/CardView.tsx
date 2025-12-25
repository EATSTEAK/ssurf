import { View, ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  cardView: {
    backgroundColor: theme.colors.surfaceDim,
    padding: theme.gap(3),
    gap: theme.gap(2),
  },
}));

export const CardView = ({ style, ...props }: ViewProps) => {
  return <View style={[styles.cardView, style]} {...props} />;
};
