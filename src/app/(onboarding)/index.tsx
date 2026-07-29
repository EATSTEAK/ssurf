import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { LoginDisclaimer } from '@/features/(onboarding)/ui/LoginDisclaimer';
import { LoginForm } from '@/features/(onboarding)/ui/LoginForm';
import { DoneStep, IntroStep, PermissionsStep } from '@/features/(onboarding)/ui/OnboardingSteps';
import { useRusaintSession } from '@/shared/providers/RusaintSessionProvider';

type OnboardingStep = 'done' | 'intro' | 'login' | 'permissions';

const styles = StyleSheet.create((theme) => ({
  root: {
    backgroundColor: theme.colors.primary,
    flex: 1,
  },
}));

export default function OnboardingPage() {
  const { completeOnboarding, hasCredential, studentId } = useRusaintSession();
  const [step, setStep] = useState<OnboardingStep>(hasCredential ? 'intro' : 'login');

  const finishOnboarding = async () => {
    try {
      await completeOnboarding();
      router.replace('/(tabs)/chapel');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert('온보딩 완료 실패', '잠시 후 다시 시도해 주세요.');
    }
  };

  if (step === 'intro') {
    return <IntroStep onNext={() => setStep('permissions')} />;
  }

  if (step === 'permissions' && studentId) {
    return <PermissionsStep onNext={() => setStep('done')} studentId={studentId} />;
  }

  if (step === 'login' || step === 'permissions') {
    return (
      <View style={styles.root}>
        <LoginForm onSuccess={() => setStep('intro')} />
        <LoginDisclaimer />
      </View>
    );
  }

  return <DoneStep onStart={finishOnboarding} />;
}
