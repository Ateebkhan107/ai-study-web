import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import InstituteWorkspace from "@/components/institute/InstituteWorkspace";
import { getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";

export default async function InstituteSlugPage({ params }) {
  const { userId, onboardingComplete } = await getAuthContext();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
  }

  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--background)]">
      <Navbar />
      <InstituteWorkspace slug={slug} />
    </div>
  );
}
