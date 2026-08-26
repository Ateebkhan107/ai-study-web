"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, X, Loader2 } from "lucide-react";

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
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Study Group</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Start a focused space for doubts, revision, or mock-test planning.
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-5 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2">
        <p className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-brand">
          <BookOpen className="h-4 w-4 shrink-0" />
          <span>This group will be in the <span className="uppercase">{examTrack}</span> community</span>
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
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand/60 focus:outline-none dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/60 dark:text-white"
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
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand/60 focus:outline-none dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/60 dark:text-white"
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
                className={`rounded-lg border p-3 text-left transition-colors ${
                  privacy === opt.value
                    ? "border-brand/60 bg-brand/10"
                    : "border-slate-200 hover:border-brand/40 dark:border-[var(--border)]"
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
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-bold text-black transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
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
