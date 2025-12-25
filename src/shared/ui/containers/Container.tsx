import { View, ViewProps } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.gap(2),
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
}));

export const SafeContainer = ({ style, ...props }: SafeAreaViewProps) => {
  return <SafeAreaView style={[styles.container, style]} {...props} />;
};

export const Container = ({ style, ...props }: ViewProps) => {
  return <View style={[styles.container, style]} {...props} />;
};
