import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE, getAuthContext, getPostAuthRedirectPath } from "@/lib/auth";

export default async function Page() {
  const { userId, onboardingComplete } = await getAuthContext();

  if (userId) {
    redirect(getPostAuthRedirectPath(onboardingComplete));
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp fallbackRedirectUrl={DASHBOARD_ROUTE} />
    </div>
  );
}
