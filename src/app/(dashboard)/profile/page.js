import { auth } from "@clerk/nextjs/server";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { getProfilePageData } from "@/services/profile.server";
import { getUserAccessContext } from "@/lib/accessControl";

export default async function ProfilePage() {
  const { userId, sessionClaims } = await auth();
  const profile = userId ? await getProfilePageData(userId, sessionClaims) : null;
  const accessContext = userId ? await getUserAccessContext({ userId }) : {};

  return <ProfilePageClient initialProfile={profile} plan={accessContext.plan} />;
}
