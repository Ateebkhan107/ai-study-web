"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getLevelFromXP } from "@/utils/levelEngine";

function getTierColor(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("leader") || t.includes("master")) {
    return "border-amber-400 dark:border-brand shadow-[0_0_10px_rgba(234,179,8,0.3)]";
  }
  if (t.includes("expert") || t.includes("pro")) {
    return "border-slate-300 dark:border-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.3)]";
  }
  return "border-orange-400/80 dark:border-orange-700/80 shadow-[0_0_10px_rgba(249,115,22,0.2)]";
}

export default function ProfileMenu({ plan }) {
  const { user } = useUser();
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function loadXP() {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setXp(data.xp || 0);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadXP();
  }, [user]);

  const levelStats = getLevelFromXP(xp);
  const ringClass = getTierColor(levelStats.title);


  const renderBadge = () => {
    if (!plan || plan === "FREE") return null;

    const isAiMode = plan === "AI_MODE";
    return (
      <span
        className={`absolute -bottom-1 -right-4 md:-right-6 z-10 flex h-4 items-center justify-center whitespace-nowrap rounded-full px-1.5 text-[8px] sm:text-[9px] font-black tracking-wider shadow-sm backdrop-blur-md ${
          isAiMode
            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-yellow-500/30"
            : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/20"
        }`}
      >
        {isAiMode ? "AI MODE" : "PRO"}
      </span>
    );
  };

  return (
    <div className="relative inline-flex items-center">
    <div className={`relative flex items-center justify-center rounded-full border-[2.5px] p-0.5 ${ringClass}`}>
      <UserButton
        userProfileMode="navigation"
        userProfileUrl="/profile"
        appearance={{
          elements: {
            userButtonTrigger:
              "flex h-[28px] w-[28px] sm:h-[30px] sm:w-[30px] items-center justify-center rounded-full outline-none",
            avatarBox: "h-full w-full",
          },
        }}
      />
    </div>
      {renderBadge()}
    </div>
  );
}
