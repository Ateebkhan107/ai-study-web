import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE, getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";
import AuthLayout from "@/components/AuthLayout";
import AuthRedirectGuard from "@/components/AuthRedirectGuard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function getSafeRedirectUrl(url) {
  if (!url || typeof url !== "string") return DASHBOARD_ROUTE;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }
  return DASHBOARD_ROUTE;
}

export default async function Page({ searchParams }) {
  const { userId, onboardingComplete } = await getAuthContext();
  const params = await searchParams;
  const rawRedirectUrl = params?.redirect_url;
  const safeRedirect = getSafeRedirectUrl(rawRedirectUrl);
  const hasCustomRedirect = Boolean(rawRedirectUrl && safeRedirect !== DASHBOARD_ROUTE);

  if (userId) {
    if (!onboardingComplete) {
      redirect(ONBOARDING_ROUTE);
    }
    redirect(safeRedirect);
  }

  return (
    <AuthLayout>
      <AuthRedirectGuard />

      {/* Return link when redirected from a feature */}
      {hasCustomRedirect && (
        <div className="mb-4">
          <Link
            href={safeRedirect}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to browsing</span>
          </Link>
        </div>
      )}

      <div className="mb-5 sm:mb-7">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "#EAB308", letterSpacing: "0.15em" }}
        >
          {hasCustomRedirect ? "Get Started to Continue" : "Get Started"}
        </p>
        <h2
          className="text-3xl font-black font-display mb-2 tracking-tight sm:text-4xl"
          style={{ color: "#FFFFFF" }}
        >
          Create Free Account
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
          {hasCustomRedirect
            ? "Sign in to continue your preparation. Create your free account to start practicing and track your progress."
            : "Start your PrepZii journey and unlock smarter preparation."}
        </p>
      </div>

      {/* Clerk card wrapper — glass morphism */}
      <div
        className="w-full max-w-full rounded-2xl p-4 sm:p-6"
        style={{
          background: "rgba(0,0,0,0.85)",
          border: "1px solid rgba(234,179,8,0.25)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 0 40px rgba(234,179,8,0.08), inset 0 1px 0 rgba(234,179,8,0.06)",
        }}
      >
        <SignUp
          routing="path"
          path="/sign-up"
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
        Already have an account?{" "}
        <Link
          href={rawRedirectUrl ? `/sign-in?redirect_url=${encodeURIComponent(safeRedirect)}` : "/sign-in"}
          className="auth-link font-bold transition-colors duration-150"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
