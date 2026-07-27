import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <AdminSidebar />
      {/* 
        lg:pl-64 pushes the content right on desktop to make room for the sidebar.
        pt-16 pushes content down on mobile to make room for the mobile header.
      */}
      <div className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}