import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  DASHBOARD_ROUTE,
  getAuthContext,
  getPostAuthRedirectPath,
  SIGN_IN_ROUTE,
} from "@/lib/auth";

import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import { cookies } from "next/headers";

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
    redirect(getPostAuthRedirectPath(onboardingComplete));
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
    const validYears = getYearOptions();

    if (!EXAMS.includes(targetExam) || !validYears.includes(targetYear)) {
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


    const { error } = await supabase
      .from("user_profiles")
      .upsert({
        clerk_user_id: actionUserId,
        email,
        full_name: fullName,
        exam: targetExam,
        target_year: targetYear,
        
      });
//     console.log("SUPABASE ERROR:", error);

    if (error) {
      console.error(error);
      throw new Error("Failed to save profile");
    }
    

    await client.users.updateUserMetadata(actionUserId, {
      publicMetadata: {
        onboardingComplete: true,
        targetExam,
        targetYear,
      },
    });

    const cookieStore = await cookies();

cookieStore.set("prepzii_track", targetExam.toLowerCase(), {
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
});

    redirect(DASHBOARD_ROUTE);
  }

  const yearOptions = getYearOptions();
  const defaultYear = yearOptions[0];
  const displayName =
    user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || "there";

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-8">
        <Logo className="mb-8 justify-center" />
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Onboarding
          </p>
          <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Confirm your exam target so we can unlock the dashboard.
          </p>
        </div>

        <form action={completeOnboarding} className="space-y-6">

          <div>
  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">
    Full Name
  </label>

 <input
    type="text"
    name="fullName"
    placeholder="Enter your full name"
    defaultValue={user?.fullName || ""}
    required
    minLength={3}
    maxLength={50}
    className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-black dark:text-white"
/>
</div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">
              Target Exam
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EXAMS.map((exam) => (
                <label
                  key={exam}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-4 text-sm font-semibold text-black dark:text-white"
                >
                  <input
                    type="radio"
                    name="targetExam"
                    value={exam}
                    defaultChecked={exam === "JEE"}
                    className="h-4 w-4"
                  />
                  {exam}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="targetYear"
              className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3"
            >
              Target Year
            </label>
            <select
              id="targetYear"
              name="targetYear"
              defaultValue={defaultYear}
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-black dark:text-white"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 transition-opacity"
          >
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
