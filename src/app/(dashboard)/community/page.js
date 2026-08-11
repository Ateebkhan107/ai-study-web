import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import PageWrapper from "@/components/PageWrapper";
import CommunityHub from "@/components/community/CommunityHub";

export const metadata = {
  title: "Study Community — PrepZii",
  description: "Connect with JEE and NEET aspirants. Join study groups, chat, and collaborate.",
};

export default async function CommunityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Get user's exam track from user_profiles
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("exam, full_name")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  const examTrack = (profile.exam || "JEE").toUpperCase();

  return (
    <PageWrapper>
      <CommunityHub examTrack={examTrack} currentUserId={userId} />
    </PageWrapper>
  );
}
