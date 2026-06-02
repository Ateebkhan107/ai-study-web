import { redirect } from "next/navigation";
import { getAuthContext, getPostAuthRedirectPath, SIGN_UP_ROUTE } from "@/lib/auth";

export default async function RootPage() {
  const { userId, onboardingComplete } = await getAuthContext();

  if (!userId) {
    redirect(SIGN_UP_ROUTE);
  }

  redirect(getPostAuthRedirectPath(onboardingComplete));
}
