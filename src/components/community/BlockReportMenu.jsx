"use client";

import { useState } from "react";
import { Flag, ShieldOff, Loader2 } from "lucide-react";

export default function BlockReportMenu({ targetUserId, targetType = "user", targetId, onBlock, onReport }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);

  async function handleBlock() {
    if (!targetUserId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/community/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to block."); return; }
      setDone("blocked");
      setShowMenu(false);
      if (onBlock) onBlock(targetUserId);
    } catch {
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReport() {
    const trimmed = reason.trim();
    if (!trimmed) { setError("Please describe the issue."); return; }
    if (trimmed.length > 500) { setError("Reason too long (max 500 chars)."); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/community/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId: targetId || targetUserId, reason: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to report."); return; }
      setDone("reported");
      setShowReportForm(false);
      setShowMenu(false);
      if (onReport) onReport();
    } catch {
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done === "blocked") return <span className="text-xs text-slate-400">User blocked</span>;
  if (done === "reported") return <span className="text-xs text-slate-400">Reported</span>;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((v) => !v)}
        id={`block-report-menu-${targetUserId || targetId}`}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="More options"
      >
        <span className="text-base leading-none">⋯</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <button
            onClick={() => { setShowReportForm(true); setShowMenu(false); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Flag className="w-4 h-4 text-amber-500" /> Report
          </button>
          {targetUserId && (
            <button
              onClick={handleBlock}
              disabled={isSubmitting}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-slate-800"
            >
              <ShieldOff className="w-4 h-4" /> Block User
            </button>
          )}
        </div>
      )}

      {showReportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Describe the issue clearly. Max 500 characters.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="What is the problem?"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{reason.length}/500</p>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowReportForm(false); setError(null); }}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
