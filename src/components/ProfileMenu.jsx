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

export default function ProfileMenu() {
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

  return (
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
  );
}
