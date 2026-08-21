"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";

export default function CreateGroupForm({ examTrack, onSuccess, onCancel }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 60) {
      setError("Group name must be 3–60 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/community/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, description: description.trim(), privacy }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create group.");
        return;
      }

      if (onSuccess) onSuccess(data.group);
      else router.push(`/community/groups/${data.group.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="glass-card p-6 md:p-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Study Group</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-4 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          📚 This group will be in the <span className="uppercase">{examTrack}</span> community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="e.g. JEE Physics Mastery"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] dark:bg-[var(--surface-elevated)]/60 border border-slate-200 dark:border-[var(--border)] text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <p className="mt-1 text-xs text-slate-400">{name.length}/60</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="What is this group about?"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] dark:bg-[var(--surface-elevated)]/60 border border-slate-200 dark:border-[var(--border)] text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
          />
          <p className="mt-1 text-xs text-slate-400">{description.length}/300</p>
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Privacy
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { value: "PUBLIC", label: "Public", desc: "Anyone can join" },
              { value: "PRIVATE", label: "Private", desc: "Request to join" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrivacy(opt.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  privacy === opt.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-slate-200 dark:border-[var(--border)] hover:border-indigo-300"
                }`}
              >
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{opt.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          id="create-group-submit"
          className="w-full py-3 rounded-xl bg-brand text-white font-bold text-sm shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating…
            </>
          ) : (
            "Create Group"
          )}
        </button>
      </form>
    </div>
  );
}
