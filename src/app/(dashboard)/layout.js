import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { getAuthContext, ONBOARDING_ROUTE } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const { userId, onboardingComplete } = await getAuthContext();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!onboardingComplete) {
    redirect(ONBOARDING_ROUTE);
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
