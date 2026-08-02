import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import PageWrapper from "@/components/PageWrapper";
import DMInbox from "@/components/community/DMInbox";

export const metadata = {
  title: "Messages — PrepZii Community",
};

export default async function MessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <PageWrapper title="Messages" subtitle="Message requests and active conversations.">
      <div className="max-w-2xl mx-auto">
        <DMInbox currentUserId={userId} />
      </div>
    </PageWrapper>
  );
}
