import { Redirect } from 'expo-router';

import { LoginForm } from '@/app/(onboarding)/components/LoginForm';
import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';

export default function OnboardingPage() {
  const { hasCredential } = useRusaintSession();

  if (hasCredential()) {
    return <Redirect href="/chapel" />;
  }

  return <LoginForm />;
}
