"use client";

import ManagePYQs from "@/components/admin/ManagePYQs";

export default function AdminQuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-display mb-2">Question Manager</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage all your questions, apply filters, and bulk edit.</p>
      </div>
      
      <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-3 shadow-sm sm:p-6">
        <ManagePYQs />
      </div>
    </div>
  );
}
