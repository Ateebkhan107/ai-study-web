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
    <div className={`group flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {/* Avatar placeholder */}
      {!isOwn && (
        <div className="mt-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-brand-hover text-xs font-bold text-white">
          {(message.senderName || "?")[0]?.toUpperCase()}
        </div>
      )}

      <div className={`flex max-w-[82%] flex-col sm:max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender + time */}
        {!isOwn && (
          <span className="mb-1 px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {message.senderName || "Unknown"}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            isOwn
              ? "rounded-br-md bg-indigo-600 text-white"
              : isDeleted
              ? "rounded-bl-md bg-slate-100 text-slate-400 italic dark:bg-[var(--surface-elevated)] dark:text-slate-500"
              : "rounded-bl-md border border-slate-100 bg-[var(--card)] text-slate-900 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] dark:text-white"
          } ${message.optimistic ? "opacity-70" : "opacity-100"}`}
        >
          {/* IMPORTANT: Plain text rendering — never dangerouslySetInnerHTML */}
          {isDeleted ? "[Message deleted]" : message.content}
        </div>

        {/* Time + actions */}
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="px-1 text-[11px] text-slate-400 dark:text-slate-500">
            {formatTime(message.created_at)}
          </span>

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
