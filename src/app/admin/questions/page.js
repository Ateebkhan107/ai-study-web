"use client";

import QuestionManager from "@/components/admin/QuestionManager";

export default function AdminQuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-2">Question Manager</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage all your questions, apply filters, and bulk edit.</p>
      </div>
      
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        {/* We will extract the "manage" tab of QuestionManager as the default view here */}
        <QuestionManager defaultTab="manage" />
      </div>
    </div>
  );
}
