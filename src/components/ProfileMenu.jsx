"use client";

import { UserButton } from "@clerk/nextjs";

export default function ProfileMenu() {
  return (
    <UserButton
      userProfileMode="navigation"
      userProfileUrl="/profile"
      appearance={{
        elements: {
          userButtonTrigger:
            "flex h-9 w-9 items-center justify-center rounded-xl outline-none ring-1 ring-transparent transition-[box-shadow,background-color] duration-200 hover:bg-slate-100 hover:ring-indigo-300/70 dark:hover:bg-white/[0.06] dark:hover:ring-indigo-400/30 sm:h-[38px] sm:w-[38px]",
          avatarBox: "h-8 w-8 sm:h-[34px] sm:w-[34px]",
        },
      }}
    />
  );
}
