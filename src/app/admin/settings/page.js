"use client";

import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black font-display mb-2 flex items-center gap-2">
          Settings <SettingsIcon className="w-6 h-6" />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Configure global app settings and feature flags.</p>
      </div>

      <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-6">
        
        <div>
          <h3 className="font-bold text-lg border-b border-gray-100 dark:border-[var(--border-subtle)] pb-2 mb-4">Exam Defaults</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">Default Duration (mins)</p>
                <p className="text-xs text-gray-500">Auto-fill duration for new exams</p>
              </div>
              <input type="number" defaultValue={180} className="border p-2 rounded-lg bg-transparent w-24 text-center" disabled />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">Default Total Marks</p>
                <p className="text-xs text-gray-500">Auto-fill marks for new exams</p>
              </div>
              <input type="number" defaultValue={300} className="border p-2 rounded-lg bg-transparent w-24 text-center" disabled />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg border-b border-gray-100 dark:border-[var(--border-subtle)] pb-2 mb-4 mt-8">Storage Configuration</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">Image Storage Bucket</p>
                <p className="text-xs text-gray-500">Supabase bucket for question images</p>
              </div>
              <span className="text-sm font-mono bg-gray-100 dark:bg-[var(--surface-elevated)] px-3 py-1 rounded">pyq-images</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[var(--border-subtle)]">
          <p className="text-sm text-gray-500 text-center">Settings configuration is currently hardcoded for stability. Future updates will allow dynamic overrides.</p>
        </div>

      </div>
    </div>
  );
}
