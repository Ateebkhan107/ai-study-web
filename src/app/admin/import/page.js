"use client";

import QuestionManager from "@/components/admin/QuestionManager";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-display mb-2">Import Center</h1>
        <p className="text-gray-500 dark:text-gray-400">Upload your CSV files to automatically import questions into exams.</p>
      </div>
      
      <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
        <QuestionManager defaultTab="import" />
      </div>
    </div>
  );
}
