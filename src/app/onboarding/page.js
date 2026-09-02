import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ACCOUNT_TYPES,
  DASHBOARD_ROUTE,
  getAuthContext,
  INSTITUTE_ROUTE,
  getPostAuthRedirectPath,
  SIGN_IN_ROUTE,
} from "@/lib/auth";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Logo from "@/components/Logo";
import { cookies } from "next/headers";
import OnboardingForm from "@/components/OnboardingForm";
import { isUniqueUsernameError, validateUsername } from "@/lib/username";

const EXAMS = ["JEE", "NEET"];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 4 }, (_, index) => currentYear + index);
}

export default async function OnboardingPage() {
  const { userId, onboardingComplete, user } = await getAuthContext();

  if (!userId) {
    redirect(SIGN_IN_ROUTE);
  }

  if (onboardingComplete) {
    redirect(getPostAuthRedirectPath(onboardingComplete, user));
  }

  async function completeOnboarding(formData) {
    "use server";

//     console.log("ONBOARDING FUNCTION STARTED");

    const { userId: actionUserId } = await auth();

    if (!actionUserId) {
      redirect(SIGN_IN_ROUTE);
    }

    const targetExam = formData.get("targetExam");
    const targetYear = Number(formData.get("targetYear"));
    const fullName = formData.get("fullName");
    const usernameInput = formData.get("username");
    const accountType = formData.get("accountType");
    const validYears = getYearOptions();

    if (!Object.values(ACCOUNT_TYPES).includes(accountType)) {
      throw new Error("Invalid account type.");
    }

    const normalizedExam = EXAMS.includes(targetExam) ? targetExam : "JEE";
    const normalizedYear = validYears.includes(targetYear) ? targetYear : validYears[0];
    const usernameValidation = validateUsername(usernameInput);

    if (!usernameValidation.ok) {
      throw new Error(usernameValidation.error);
    }

    if (accountType === ACCOUNT_TYPES.STUDENT && (!EXAMS.includes(targetExam) || !validYears.includes(targetYear))) {
      throw new Error("Invalid onboarding selection.");
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(actionUserId);

    const email = clerkUser.primaryEmailAddress?.emailAddress || "";

   
//     console.log("USER ID:", actionUserId);
//     console.log("EMAIL:", email);
//     console.log("NAME:", fullName);
//     console.log("EXAM:", targetExam);
//     console.log("YEAR:", targetYear);


    const profilePayload = {
      clerk_user_id: actionUserId,
      email,
      full_name: fullName,
      username: usernameValidation.username,
      exam: normalizedExam,
      target_year: normalizedYear,
      account_type: accountType,
    };

    const { data: existingProfile, error: lookupError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", actionUserId)
      .maybeSingle();

    if (lookupError) {
      console.error(lookupError);
      throw new Error("Failed to save profile");
    }

    const { error } = existingProfile
      ? await supabaseAdmin
        .from("user_profiles")
        .update(profilePayload)
        .eq("id", existingProfile.id)
      : await supabaseAdmin
      .from("user_profiles")
        .insert(profilePayload);
//     console.log("SUPABASE ERROR:", error);

    if (error) {
      console.error(error);
      if (isUniqueUsernameError(error)) {
        throw new Error("That username is already taken.");
      }
      throw new Error("Failed to save profile");
    }
    

    await client.users.updateUserMetadata(actionUserId, {
      publicMetadata: {
        onboardingComplete: true,
        accountType,
        targetExam: normalizedExam,
        targetYear: normalizedYear,
      },
    });

    const cookieStore = await cookies();

cookieStore.set("prepzii_track", normalizedExam.toLowerCase(), {
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
});

    const redirectTarget = accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN
      ? INSTITUTE_ROUTE
      : `${DASHBOARD_ROUTE}?tour=welcome`;

    redirect(redirectTarget);
  }

  const yearOptions = getYearOptions();
  const defaultYear = yearOptions[0];
  const displayName =
    user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || "there";

  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-3xl shadow-sm p-8">
        <Logo className="mb-8 justify-center" />
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Onboarding
          </p>
          <h1 className="text-3xl font-black font-display text-black dark:text-white tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Choose how you use PrepZii. Everyone uses the same login.
          </p>
        </div>

        <OnboardingForm
          action={completeOnboarding}
          accountTypes={ACCOUNT_TYPES}
          exams={EXAMS}
          yearOptions={yearOptions}
          defaultYear={defaultYear}
          defaultFullName={user?.fullName || ""}
        />
      </div>
    </div>
  );
}
