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
    <div className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar placeholder */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold mt-1">
        {(message.senderName || "?")[0]?.toUpperCase()}
      </div>

      <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender + time */}
        {!isOwn && (
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 px-1">
            {message.senderName || "Unknown"}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : isDeleted
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 italic rounded-tl-sm"
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-sm"
          } ${message.optimistic ? "opacity-70" : "opacity-100"}`}
        >
          {/* IMPORTANT: Plain text rendering — never dangerouslySetInnerHTML */}
          {isDeleted ? "[Message deleted]" : message.content}
        </div>

        {/* Time + actions */}
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-slate-400 dark:text-slate-500 px-1">
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
