"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  List, 
  Image as ImageIcon, 
  Upload, 
  Bell, 
  Target, 
  Award, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { useClerk } from "@clerk/nextjs";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);

  const contentNav = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Exams", href: "/admin/exams", icon: FileText },
    { name: "Questions", href: "/admin/questions", icon: List },
    { name: "Import / Review", href: "/admin/imports", icon: Upload },
    { name: "Images", href: "/admin/images", icon: ImageIcon },
  ];

  const usersNav = [
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Community Moderation", href: "/admin/community", icon: MessageSquare },
  ];

  const engagementNav = [
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Badges", href: "/admin/badges", icon: Award },
    { name: "Daily Goals", href: "/admin/goals", icon: Target },
  ];

  const systemNav = [
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const NavItem = ({ item }) => {
    const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
    return (
      <Link 
        key={item.name} 
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-sm
          ${isActive 
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white'}
        `}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-50">
        <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          PrepZii Admin
        </span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 
        w-64 flex flex-col transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 hidden lg:flex">
          <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            PrepZii Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 mt-16 lg:mt-0">
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Content</div>
          {contentNav.map(item => <NavItem key={item.name} item={item} />)}

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-6">Users</div>
          {usersNav.map(item => <NavItem key={item.name} item={item} />)}

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-6">Engagement</div>
          {engagementNav.map(item => <NavItem key={item.name} item={item} />)}

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-6">System</div>
          {systemNav.map(item => <NavItem key={item.name} item={item} />)}
          
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => signOut({ redirectUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
