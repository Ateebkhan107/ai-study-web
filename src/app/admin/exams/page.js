"use client";

import ExamManager from "@/components/admin/ExamManager";

export default function AdminExamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-2">Exam Manager</h1>
        <p className="text-gray-500 dark:text-gray-400">Create, edit, publish, and manage all your PYQ exams.</p>
      </div>
      
      <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
        <ExamManager />
      </div>
    </div>
  );
}
