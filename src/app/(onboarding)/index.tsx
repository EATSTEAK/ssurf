import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { LoginDisclaimer } from '@/features/(onboarding)/ui/LoginDisclaimer';
import { LoginForm } from '@/features/(onboarding)/ui/LoginForm';

const styles = StyleSheet.create((theme) => ({
  safeAreaView: {
    backgroundColor: theme.colors.primary,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
}));

export default function OnboardingPage() {
  return (
    <View style={styles.safeAreaView}>
      <LoginForm />
      <LoginDisclaimer />
    </View>
  );
}
