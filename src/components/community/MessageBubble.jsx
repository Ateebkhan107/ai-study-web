"use client";

import { useState, memo } from "react";
import { Trash2, Check, Clock, AlertCircle } from "lucide-react";
import BlockReportMenu from "./BlockReportMenu";

export function formatMessageTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function getDateDividerLabel(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) return "Yesterday";

  const isSameYear = date.getFullYear() === now.getFullYear();
  if (isSameYear) {
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function MessageBubbleComponent({
  message,
  currentUserId,
  context,
  contextId,
  onDelete,
  onRetry,
  isFirstInGroup = true,
  isLastInGroup = true,
  dateDivider = null,
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
    <div className="w-full">
      {/* Date Divider */}
      {dateDivider && (
        <div className="my-3 flex items-center justify-center">
          <span className="rounded-full border border-slate-200/90 bg-slate-100/90 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-xs backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400">
            {dateDivider}
          </span>
        </div>
      )}

      {/* Message Row */}
      <div
        className={`group flex gap-2.5 transition-opacity duration-150 ${
          isFirstInGroup ? "mt-2.5" : "mt-0.5"
        } ${isOwn ? "justify-end" : "justify-start"}`}
      >
        {/* Avatar for others (shown on first message of consecutive group) */}
        {!isOwn && (
          <div className="w-8 shrink-0 flex items-start">
            {isFirstInGroup ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 shadow-xs dark:border-white/10 dark:bg-[var(--surface-elevated)] dark:text-slate-200">
                {(message.senderName || "?")[0]?.toUpperCase()}
              </div>
            ) : (
              <div className="h-8 w-8" />
            )}
          </div>
        )}

        <div className={`flex max-w-[85%] flex-col sm:max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
          {/* Sender header (only on first in group) */}
          {!isOwn && isFirstInGroup && (
            <div className="mb-1 flex items-center gap-2 px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {message.senderName || "Member"}
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {formatMessageTime(message.created_at)}
              </span>
            </div>
          )}

          {/* Chat Bubble with dynamic corner radius */}
          <div
            className={`break-words px-3.5 py-2 text-sm leading-relaxed shadow-xs transition-all ${
              isOwn
                ? isFailed
                  ? "rounded-2xl rounded-br-xs border border-red-300 bg-red-50 text-slate-900 dark:border-red-500/40 dark:bg-red-950/40 dark:text-white"
                  : isFirstInGroup && isLastInGroup
                  ? "rounded-2xl rounded-br-xs border border-amber-300/80 bg-amber-100/80 text-amber-950 dark:border-brand/40 dark:bg-[#1c1912] dark:text-white"
                  : isFirstInGroup
                  ? "rounded-2xl rounded-br-md border border-amber-300/80 bg-amber-100/80 text-amber-950 dark:border-brand/40 dark:bg-[#1c1912] dark:text-white"
                  : isLastInGroup
                  ? "rounded-2xl rounded-tr-md rounded-br-xs border border-amber-300/80 bg-amber-100/80 text-amber-950 dark:border-brand/40 dark:bg-[#1c1912] dark:text-white"
                  : "rounded-2xl rounded-r-md border border-amber-300/80 bg-amber-100/80 text-amber-950 dark:border-brand/40 dark:bg-[#1c1912] dark:text-white"
                : isDeleted
                ? "rounded-2xl rounded-bl-xs bg-slate-100 italic text-slate-400 dark:bg-[var(--surface-elevated)] dark:text-slate-500"
                : isFirstInGroup && isLastInGroup
                ? "rounded-2xl rounded-bl-xs border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100"
                : isFirstInGroup
                ? "rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100"
                : isLastInGroup
                ? "rounded-2xl rounded-tl-md rounded-bl-xs border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100"
                : "rounded-2xl rounded-l-md border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100"
            } ${isSending ? "opacity-75" : "opacity-100"}`}
          >
            {isDeleted ? "[Message deleted]" : message.content}
          </div>

          {/* Status + Actions */}
          <div className={`mt-0.5 flex items-center gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            {isOwn && (
              <div className="flex items-center gap-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                <span>{formatMessageTime(message.created_at)}</span>

                {isSending && (
                  <span title="Sending…" className="inline-flex items-center">
                    <Clock className="h-2.5 w-2.5 text-slate-400 animate-pulse" />
                  </span>
                )}
                {status === "sent" && !isDeleted && (
                  <span title="Sent" className="inline-flex items-center text-amber-600 dark:text-brand">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </span>
                )}
                {isFailed && (
                  <button
                    type="button"
                    onClick={() => onRetry && onRetry(message)}
                    className="inline-flex items-center gap-1 font-semibold text-rose-500 hover:text-rose-600"
                    title="Retry sending message"
                  >
                    <AlertCircle className="h-2.5 w-2.5" />
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
                    className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
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
    prev.currentUserId === next.currentUserId &&
    prev.isFirstInGroup === next.isFirstInGroup &&
    prev.isLastInGroup === next.isLastInGroup &&
    prev.dateDivider === next.dateDivider
  );
});

export default MessageBubble;
