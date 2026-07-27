"use client";

import QuestionManager from "@/components/admin/QuestionManager";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-2">Import Center</h1>
        <p className="text-gray-500 dark:text-gray-400">Upload your CSV files to automatically import questions into exams.</p>
      </div>
      
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <QuestionManager defaultTab="import" />
      </div>
    </div>
  );
}
