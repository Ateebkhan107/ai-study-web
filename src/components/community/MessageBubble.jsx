"use client";

import { useState, memo } from "react";
import { Trash2, Check, Clock, AlertCircle } from "lucide-react";
import BlockReportMenu from "./BlockReportMenu";

function formatTime(iso) {
  if (!iso) return "Just now";
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

function MessageBubbleComponent({
  message,
  currentUserId,
  context,
  contextId,
  onDelete,
  onRetry,
}) {
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
  const status = message.status || (message.optimistic ? "sending" : "sent");
  const isFailed = status === "failed";
  const isSending = status === "sending";

  return (
    <div
      className={`group flex gap-2 py-1 transition-opacity duration-150 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-0.5 motion-safe:duration-150 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar for others */}
      {!isOwn && (
        <div className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-600 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-300">
          {(message.senderName || "?")[0]?.toUpperCase()}
        </div>
      )}

      <div className={`flex max-w-[86%] flex-col sm:max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender + time for other users */}
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
          className={`break-words rounded-xl px-3.5 py-2 text-sm leading-relaxed shadow-sm transition-all ${
            isOwn
              ? isFailed
                ? "rounded-br-sm border border-red-300/80 bg-red-50/70 text-slate-900 dark:border-red-500/40 dark:bg-red-950/30 dark:text-white"
                : "rounded-br-sm border border-brand/30 bg-brand/10 text-slate-900 dark:bg-[var(--surface-elevated)] dark:text-white"
              : isDeleted
              ? "rounded-bl-sm bg-slate-100 italic text-slate-400 dark:bg-[var(--surface-elevated)] dark:text-slate-500"
              : "rounded-bl-sm border border-slate-200 bg-white text-slate-900 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-white"
          } ${isSending ? "opacity-85" : "opacity-100"}`}
        >
          {/* Plain text rendering */}
          {isDeleted ? "[Message deleted]" : message.content}
        </div>

        {/* Status + Time + Actions */}
        <div className={`mt-1 flex items-center gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          {isOwn && (
            <div className="flex items-center gap-1 px-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span>{formatTime(message.created_at)}</span>

              {/* Message delivery status for sender */}
              {isSending && (
                <span title="Sending…" className="inline-flex items-center">
                  <Clock className="h-3 w-3 text-slate-400 animate-pulse" />
                </span>
              )}
              {status === "sent" && !isDeleted && (
                <span title="Sent" className="inline-flex items-center">
                  <Check className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                </span>
              )}
              {isFailed && (
                <button
                  type="button"
                  onClick={() => onRetry && onRetry(message)}
                  className="prepzii-interactive inline-flex items-center gap-1 font-semibold text-red-500 hover:text-red-600"
                  title="Retry sending message"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span className="underline">Retry</span>
                </button>
              )}
            </div>
          )}

          {!isDeleted && !isSending && !isFailed && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {isOwn ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete message"
                  className="prepzii-interactive p-1 rounded text-slate-400 hover:text-red-500"
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

const MessageBubble = memo(MessageBubbleComponent, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.status === next.message.status &&
    prev.message.is_deleted === next.message.is_deleted &&
    prev.message.senderName === next.message.senderName &&
    prev.message.created_at === next.message.created_at &&
    prev.currentUserId === next.currentUserId
  );
});

export default MessageBubble;
