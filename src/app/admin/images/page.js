"use client";

import ImageManager from "@/components/admin/ImageManager";

export default function AdminImagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-2">Image Manager</h1>
        <p className="text-gray-500 dark:text-gray-400">Upload missing images for exam questions, options, and explanations.</p>
      </div>
      
      <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
        <ImageManager />
      </div>
    </div>
  );
}
