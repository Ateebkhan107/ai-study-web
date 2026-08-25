"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.replace("/pro");
    }, 2000);

    return () => window.clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-2xl bg-[var(--card)] p-10 shadow-xl text-center">
        <h1 className="inline-flex items-center justify-center gap-2 text-3xl font-bold text-green-600">
          <CheckCircle2 className="h-8 w-8" />
          Payment Successful
        </h1>

        <p className="mt-4 text-gray-600">
          Welcome to PrepZii Pro.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Redirecting you to the Pro page…
        </p>

        <Link
          href="/pro"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-500"
        >
          Continue to Pro
        </Link>
      </div>
    </div>
  );
}
