import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export function getPublicMetadataFromClaims(sessionClaims) {
  return (
    sessionClaims?.metadata ||
    sessionClaims?.publicMetadata ||
    sessionClaims?.public_metadata ||
    {}
  );
}

export function getEmailFromClaims(sessionClaims) {
  return (
    sessionClaims?.email ||
    sessionClaims?.email_address ||
    sessionClaims?.primary_email_address ||
    sessionClaims?.primaryEmailAddress?.emailAddress ||
    ""
  );
}

export function getDisplayNameFromClaims(sessionClaims) {
  const fullName = sessionClaims?.name || sessionClaims?.full_name;
  if (fullName) return fullName;

  return [sessionClaims?.given_name, sessionClaims?.family_name]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function getFirstNameFromClaims(sessionClaims) {
  return sessionClaims?.given_name || getDisplayNameFromClaims(sessionClaims).split(" ")[0] || "";
}

export function getUserFromAuthClaims(userId, sessionClaims) {
  if (!userId) return null;

  const publicMetadata = getPublicMetadataFromClaims(sessionClaims);
  const emailAddress = getEmailFromClaims(sessionClaims);
  const fullName = getDisplayNameFromClaims(sessionClaims);

  return {
    id: userId,
    firstName: getFirstNameFromClaims(sessionClaims),
    fullName,
    publicMetadata,
    primaryEmailAddress: emailAddress ? { emailAddress } : null,
  };
}

export async function getAuthContext() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return {
      userId: null,
      user: null,
      onboardingComplete: false,
    };
  }

  const user = getUserFromAuthClaims(userId, sessionClaims);
  let onboardingComplete = hasCompletedOnboarding(user);

  if (user.publicMetadata?.onboardingComplete === undefined) {
    const { data: profile, error } = await supabaseAdmin
      .from("user_profiles")
      .select("account_type")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Supabase onboarding profile lookup failed:", error);
      onboardingComplete = true;
    } else if (profile) {
      onboardingComplete = true;
      user.publicMetadata = {
        ...user.publicMetadata,
        onboardingComplete: true,
        accountType: profile.account_type,
      };
    }
  }

  return {
    userId,
    user,
    onboardingComplete,
    accountType: getAccountType(user),
  };
}

export function getPostAuthRedirectPath(onboardingComplete, user) {
  if (!onboardingComplete) return ONBOARDING_ROUTE;
  return getAccountType(user) === ACCOUNT_TYPES.INSTITUTE_ADMIN
    ? INSTITUTE_ROUTE
    : DASHBOARD_ROUTE;
}
