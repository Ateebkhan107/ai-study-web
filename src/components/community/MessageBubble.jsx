"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import BlockReportMenu from "./BlockReportMenu";

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function MessageBubble({ message, currentUserId, context, contextId, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(message.is_deleted || false);

  async function handleDelete() {
    if (deleting || deleted) return;
    setDeleting(true);
    try {
      const url =
        context === "group"
          ? `/api/community/groups/${contextId}/messages/${message.id}`
          : `/api/community/direct/conversations/${contextId}/messages/${message.id}`;

      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        setDeleted(true);
        if (onDelete) onDelete(message.id);
      }
    } finally {
      setDeleting(false);
    }
  }

  const isOwn = message.sender_id === currentUserId || message.isOwn;
  const isDeleted = deleted || message.is_deleted;

  return (
    <div className={`group flex gap-2 py-1 ${isOwn ? "justify-end" : "justify-start"}`}>
      {/* Avatar placeholder */}
      {!isOwn && (
        <div className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-600 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-300">
          {(message.senderName || "?")[0]?.toUpperCase()}
        </div>
      )}

      <div className={`flex max-w-[86%] flex-col sm:max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender + time */}
        {!isOwn && (
          <div className="mb-1 flex items-center gap-2 px-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {message.senderName || "Unknown"}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            isOwn
              ? "rounded-br-sm border border-brand/30 bg-brand/10 text-slate-900 dark:bg-[var(--surface-elevated)] dark:text-white"
              : isDeleted
              ? "rounded-bl-sm bg-slate-100 text-slate-400 italic dark:bg-[var(--surface-elevated)] dark:text-slate-500"
              : "rounded-bl-sm border border-slate-200 bg-white text-slate-900 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-white"
          } ${message.optimistic ? "opacity-70" : "opacity-100"}`}
        >
          {/* IMPORTANT: Plain text rendering — never dangerouslySetInnerHTML */}
          {isDeleted ? "[Message deleted]" : message.content}
        </div>

        {/* Time + actions */}
        <div className={`mt-1 flex items-center gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          {isOwn && (
            <span className="px-1 text-[11px] text-slate-400 dark:text-slate-500">
              {formatTime(message.created_at)}
            </span>
          )}

          {!isDeleted && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {isOwn ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete message"
                  className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <BlockReportMenu
                  targetUserId={message.sender_id}
                  targetType="message"
                  targetId={message.id}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
