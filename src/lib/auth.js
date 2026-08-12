import { auth, currentUser } from "@clerk/nextjs/server";

export const ONBOARDING_ROUTE = "/onboarding";
export const DASHBOARD_ROUTE = "/dashboard";
export const INSTITUTE_ROUTE = "/institute";
export const SIGN_IN_ROUTE = "/sign-in";
export const SIGN_UP_ROUTE = "/sign-up";

export const ACCOUNT_TYPES = {
  STUDENT: "STUDENT",
  INSTITUTE_ADMIN: "INSTITUTE_ADMIN",
};

export function hasCompletedOnboarding(user) {
  return Boolean(user?.publicMetadata?.onboardingComplete);
}

export function getAccountType(user) {
  return user?.publicMetadata?.accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN
    ? ACCOUNT_TYPES.INSTITUTE_ADMIN
    : ACCOUNT_TYPES.STUDENT;
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

  let user = null;

  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk currentUser() failed:", error);

    return {
      userId,
      user: null,
      onboardingComplete: true,
    };
  }

  return {
    userId,
    user,
    onboardingComplete: hasCompletedOnboarding(user),
    accountType: getAccountType(user),
  };
}

export function getPostAuthRedirectPath(onboardingComplete, user) {
  if (!onboardingComplete) return ONBOARDING_ROUTE;
  return getAccountType(user) === ACCOUNT_TYPES.INSTITUTE_ADMIN
    ? INSTITUTE_ROUTE
    : DASHBOARD_ROUTE;
}
