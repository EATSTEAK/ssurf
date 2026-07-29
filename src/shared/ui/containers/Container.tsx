import { View, ViewProps } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.gap(2),
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
}));

const UnistylesSafeAreaView = withUnistyles(SafeAreaView);

export const SafeContainer = ({ style, ...props }: SafeAreaViewProps) => {
  return <UnistylesSafeAreaView style={[styles.container, style]} {...props} />;
};

export const Container = ({ style, ...props }: ViewProps) => {
  return <View style={[styles.container, style]} {...props} />;
};
