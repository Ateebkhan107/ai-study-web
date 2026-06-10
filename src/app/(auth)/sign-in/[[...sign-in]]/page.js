import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getAuthContext, getPostAuthRedirectPath } from "@/lib/auth";
import AuthLayout from "@/components/AuthLayout";
import Logo from "@/components/Logo";

export default async function Page() {
  const { userId, onboardingComplete } = await getAuthContext();

  if (userId) {
    redirect(getPostAuthRedirectPath(onboardingComplete));
  }

  return (
  <AuthLayout>
    <div className="mb-8">
      <Logo size={40} showText={false} forceDark={true} className="mb-6" />
      <h2 className="text-4xl font-black mb-2">Welcome Back</h2>
      <p className="text-zinc-400">Continue your JEE & NEET preparation journey.</p>
    </div>
    <SignIn
      routing="path"
      path="/sign-in"
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
);
}
