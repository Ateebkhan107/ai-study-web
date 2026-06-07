import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getAuthContext, getPostAuthRedirectPath } from "@/lib/auth";
import AuthLayout from "@/components/AuthLayout";

export default async function Page() {
  const { userId, onboardingComplete } = await getAuthContext();

  if (userId) {
    redirect(getPostAuthRedirectPath(onboardingComplete));
  }

  return (
  <AuthLayout
    title="Create Account"
    subtitle="Start your Prepzii journey and unlock smarter preparation."
  >
    <SignUp
      routing="path"
      path="/sign-up"
      appearance={{
        elements: {
          card: "shadow-none border border-zinc-800 bg-zinc-950",
          header: "hidden",
          footer: "hidden",
          socialButtonsBlockButton:
            "bg-zinc-900 border-zinc-700 text-white",
          formButtonPrimary:
            "bg-white text-black hover:bg-zinc-200",
        },
      }}
    />
  </AuthLayout>
);}
