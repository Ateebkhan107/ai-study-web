import { auth } from "@clerk/nextjs/server";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { getProfilePageData } from "@/services/profile.server";

export default async function ProfilePage() {
  const { userId, sessionClaims } = await auth();
  const profile = userId ? await getProfilePageData(userId, sessionClaims) : null;

  return <ProfilePageClient initialProfile={profile} />;
}
