import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getAuthContext, getPostAuthRedirectPath } from "@/lib/auth";

export default async function Page() {
  const { userId, onboardingComplete } = await getAuthContext();

  if (userId) {
    redirect(getPostAuthRedirectPath(onboardingComplete));
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
