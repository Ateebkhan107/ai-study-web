import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getAuthContext, getPostAuthRedirectPath, ONBOARDING_ROUTE } from "@/lib/auth";
import AuthLayout from "@/components/AuthLayout";
import AuthRedirectGuard from "@/components/AuthRedirectGuard";
import Link from "next/link";
 
export default async function Page() {
  const { userId, onboardingComplete, user } = await getAuthContext();
 
  if (userId) {
    redirect(getPostAuthRedirectPath(onboardingComplete, user));
  }
 
  return (
    <AuthLayout>
      <AuthRedirectGuard />
      <div className="mb-7">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "#6366F1", letterSpacing: "0.15em" }}
        >
          Get Started
        </p>
        <h2
          className="text-4xl font-black mb-2 tracking-tight"
          style={{ color: "#F1F5FF" }}
        >
          Create Account
        </h2>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Start your Prepzii journey and unlock smarter preparation.
        </p>
      </div>
 
      {/* Clerk card wrapper — glass morphism */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(15,19,32,0.85)",
          border: "1px solid rgba(99,102,241,0.25)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 0 40px rgba(99,102,241,0.08), inset 0 1px 0 rgba(165,180,252,0.06)",
        }}
      >
        <SignUp
          routing="path"
          path="/sign-up"
          forceRedirectUrl={ONBOARDING_ROUTE}
          fallbackRedirectUrl={ONBOARDING_ROUTE}
          oauthFlow="redirect"
          appearance={{
            elements: {
              card: "shadow-none bg-transparent p-0 border-0",
              header: "hidden",
              footer: "hidden",
              socialButtonsBlockButton:
                "rounded-xl h-11 font-semibold text-sm transition-all duration-200",
              socialButtonsBlockButtonText: "text-sm font-semibold",
              dividerLine: "opacity-20",
              dividerText: "text-xs",
              formFieldLabel:
                "text-xs font-bold uppercase tracking-widest mb-1",
              formFieldInput:
                "rounded-xl h-11 px-4 text-sm transition-all duration-200",
              formButtonPrimary:
                "rounded-xl h-11 font-black text-sm transition-all duration-200",
              identityPreviewEditButton: "text-xs",
              formFieldAction: "text-xs",
              otpCodeFieldInput: "rounded-xl",
              alertText: "text-sm",
              formResendCodeLink: "text-xs",
            },
            variables: {
              colorBackground: "transparent",
              colorInputBackground: "rgba(99,102,241,0.06)",
              colorInputText: "#E0E7FF",
              colorText: "#94A3B8",
              colorTextSecondary: "#64748B",
              colorPrimary: "#6366F1",
              colorTextOnPrimaryBackground: "#ffffff",
              borderRadius: "0.75rem",
              colorNeutral: "#334155",
              fontFamily: "inherit",
            },
            layout: {
              socialButtonsPlacement: "top",
            },
          }}
        />
      </div>
 
      <p className="text-center text-xs mt-5" style={{ color: "#475569" }}>
        Already have an account?{" "}
        <Link href="/sign-in" className="auth-link font-bold transition-colors duration-150">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
