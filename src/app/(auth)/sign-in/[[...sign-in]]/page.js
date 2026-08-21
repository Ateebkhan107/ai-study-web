import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE, getAuthContext, getPostAuthRedirectPath } from "@/lib/auth";
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
          style={{ color: "#EAB308", letterSpacing: "0.15em" }}
        >
          Sign In
        </p>
        <h2
          className="text-4xl font-black mb-2 tracking-tight"
          style={{ color: "#FFFFFF" }}
        >
          Welcome Back
        </h2>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Continue your JEE &amp; NEET preparation journey.
        </p>
      </div>
 
      {/* Clerk card wrapper — glass morphism */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(0,0,0,0.85)",
          border: "1px solid rgba(234,179,8,0.25)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 0 40px rgba(234,179,8,0.08), inset 0 1px 0 rgba(234,179,8,0.06)",
        }}
      >
        <SignIn
          routing="path"
          path="/sign-in"
          forceRedirectUrl={DASHBOARD_ROUTE}
          fallbackRedirectUrl={DASHBOARD_ROUTE}
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
              colorInputBackground: "rgba(234,179,8,0.06)",
              colorInputText: "#FFFFFF",
              colorText: "#94A3B8",
              colorTextSecondary: "#64748B",
              colorPrimary: "#EAB308",
              colorTextOnPrimaryBackground: "#000000",
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
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="auth-link font-bold transition-colors duration-150">
          Sign up free
        </Link>
      </p>
    </AuthLayout>
  );
}
