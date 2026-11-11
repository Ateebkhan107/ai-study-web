"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const bodyFont = "font-[family-name:var(--font-prepzii-landing-body)]";

export default function LandingAuthLinks() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="flex items-center gap-2">
      {!isSignedIn && isLoaded && (
        <Link
          href="/sign-in"
          className={`${bodyFont} hidden border-2 border-transparent px-3 py-1.5 text-sm font-black text-[#111111] transition-all duration-150 hover:border-[#111111] hover:bg-white hover:shadow-[3px_3px_0_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:inline-flex`}
        >
          Log in
        </Link>
      )}
      <Link
        href="/dashboard"
        prefetch={false}
        className={`${bodyFont} inline-flex items-center gap-1.5 border-[3px] border-[#111111] bg-[#F4B400] px-4 py-2 text-sm font-black text-black shadow-[4px_4px_0_#111111] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#111111]`}
      >
        {isSignedIn ? "Dashboard" : "Get Started"}
        <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />
      </Link>
    </div>
  );
}
