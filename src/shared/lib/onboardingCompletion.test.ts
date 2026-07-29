import { describe, expect, it } from 'vitest';

import {
  completeOnboardingFor,
  hasCompletedOnboarding,
  resetOnboardingFor,
} from './onboardingCompletion';

describe('onboarding completion', () => {
  it('tracks completion independently for each student', () => {
    const completions = completeOnboardingFor({ '20230001': true }, '20240002');

    expect(hasCompletedOnboarding(completions, '20230001')).toBe(true);
    expect(hasCompletedOnboarding(completions, '20240002')).toBe(true);
    expect(hasCompletedOnboarding(completions, '20250003')).toBe(false);
  });

  it('resets completion only for the selected student', () => {
    const completions = resetOnboardingFor({ '20230001': true, '20240002': true }, '20240002');

    expect(hasCompletedOnboarding(completions, '20230001')).toBe(true);
    expect(hasCompletedOnboarding(completions, '20240002')).toBe(false);
  });
});
