import { auth, currentUser } from "@clerk/nextjs/server";

export const ONBOARDING_ROUTE = "/onboarding";
export const DASHBOARD_ROUTE = "/dashboard";
export const SIGN_IN_ROUTE = "/sign-in";
export const SIGN_UP_ROUTE = "/sign-up";

export function hasCompletedOnboarding(user) {
  return Boolean(user?.publicMetadata?.onboardingComplete);
}

export async function getAuthContext() {
  const { userId } = await auth();

  if (!userId) {
    return {
      userId: null,
      user: null,
      onboardingComplete: false,
    };
  }

  const user = await currentUser();

  return {
    userId,
    user,
    onboardingComplete: hasCompletedOnboarding(user),
  };
}

export function getPostAuthRedirectPath(onboardingComplete) {
  return onboardingComplete ? DASHBOARD_ROUTE : ONBOARDING_ROUTE;
}
