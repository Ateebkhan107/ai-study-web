"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthRedirectGuard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const metadata = user?.publicMetadata || {};
    if (!metadata.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }

    router.replace(
      metadata.accountType === "INSTITUTE_ADMIN" ? "/institute" : "/dashboard"
    );
  }, [isLoaded, isSignedIn, router, user]);

  return null;
}
