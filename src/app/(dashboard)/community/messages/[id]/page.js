import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import DMChat from "@/components/community/DMChat";

export const metadata = {
  title: "Chat — PrepZii Community",
};

export default async function DMChatPage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id: convId } = await params;

  // Server-side verification that user is a participant
  const { data: conv } = await supabaseAdmin
    .from("community_direct_conversations")
    .select("id, user_one_id, user_two_id, status")
    .eq("id", convId)
    .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
    .maybeSingle();

  if (!conv) redirect("/community/messages");
  if (conv.status !== "ACTIVE") redirect("/community/messages");

  const otherId = conv.user_one_id === userId ? conv.user_two_id : conv.user_one_id;

  const { data: otherProfile } = await supabaseAdmin
    .from("user_profiles")
    .select("clerk_user_id, full_name, exam, target_year")
    .eq("clerk_user_id", otherId)
    .maybeSingle();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <DMChat
        conversationId={convId}
        currentUserId={userId}
        otherUser={otherProfile || { clerk_user_id: otherId, full_name: "Unknown" }}
      />
    </div>
  );
}
