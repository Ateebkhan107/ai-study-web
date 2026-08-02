import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import PageWrapper from "@/components/PageWrapper";
import CreateGroupForm from "@/components/community/CreateGroupForm";

export const metadata = {
  title: "Create Study Group — PrepZii Community",
};

export default async function NewGroupPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("exam")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  const examTrack = (profile.exam || "JEE").toUpperCase();

  return (
    <PageWrapper title="Create a Study Group" subtitle="Start a focused group for your exam prep.">
      <CreateGroupForm examTrack={examTrack} />
    </PageWrapper>
  );
}
