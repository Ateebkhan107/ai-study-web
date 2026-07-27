"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  List, 
  Image as ImageIcon, 
  Users, 
  UploadCloud,
  CheckCircle2,
  Clock,
  Bell
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalExams: 0,
    publishedExams: 0,
    draftExams: 0,
    totalQuestions: 0,
    missingImages: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: "Total Exams", value: stats.totalExams, icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Published Exams", value: stats.publishedExams, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Draft Exams", value: stats.draftExams, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Total Questions", value: stats.totalQuestions, icon: List, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Missing Images", value: stats.missingImages, icon: ImageIcon, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black mb-2">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome to the PrepZii Admin CMS. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                {loading ? (
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-2"></div>
                ) : (
                  <h3 className="text-4xl font-black mt-1">{card.value}</h3>
                )}
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/import" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-center gap-2 group">
            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-purple-500" />
            <span className="font-bold text-sm">Import CSV</span>
          </Link>
          <Link href="/admin/exams" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-center gap-2 group">
            <FileText className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
            <span className="font-bold text-sm">Manage Exams</span>
          </Link>
          <Link href="/admin/images" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all text-center gap-2 group">
            <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-amber-500" />
            <span className="font-bold text-sm">Missing Images</span>
          </Link>
          <Link href="/admin/notifications" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-center gap-2 group">
            <Bell className="w-8 h-8 text-gray-400 group-hover:text-green-500" />
            <span className="font-bold text-sm">Send Notification</span>
          </Link>
        </div>
      </div>
    </div>
  );
}