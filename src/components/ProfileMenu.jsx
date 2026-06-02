"use client";

import { UserButton } from "@clerk/nextjs";

export default function ProfileMenu() {
  return (
    <UserButton
      afterSignOutUrl="/sign-in"
      userProfileMode="navigation"
      userProfileUrl="/profile"
      appearance={{
        elements: {
          avatarBox: "h-9 w-9",
        },
      }}
    />
  );
}
