export type OnboardingCompletions = Record<string, boolean>;

export const ONBOARDING_COMPLETIONS_KEY = 'onboardingCompletions';
export const EMPTY_ONBOARDING_COMPLETIONS: OnboardingCompletions = {};

export const hasCompletedOnboarding = (
  completions: OnboardingCompletions,
  studentId: null | string,
) => studentId != null && completions[studentId] === true;

export const completeOnboardingFor = (
  completions: OnboardingCompletions,
  studentId: string,
): OnboardingCompletions => ({ ...completions, [studentId]: true });

export const resetOnboardingFor = (
  completions: OnboardingCompletions,
  studentId: string,
): OnboardingCompletions => {
  const nextCompletions = { ...completions };
  delete nextCompletions[studentId];
  return nextCompletions;
};
