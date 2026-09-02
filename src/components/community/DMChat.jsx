"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Loader2, ChevronUp, ChevronDown, Mail, ArrowLeft } from "lucide-react";
import { useSession } from "@clerk/nextjs";
import MessageBubble, { getDateDividerLabel } from "./MessageBubble";
import BlockReportMenu from "./BlockReportMenu";
import { useClerkSupabase } from "@/lib/useClerkSupabase";



function DMSkeleton() {
  return (
    <div className="space-y-4 px-3 py-6 sm:px-5 animate-pulse">
      <div className="flex gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-44 rounded-xl rounded-bl-sm bg-slate-200/80 dark:bg-slate-800/80 sm:w-56" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-52 rounded-xl rounded-br-sm bg-indigo-500/15 dark:bg-[var(--surface-elevated)] sm:w-64" />
      </div>
    </div>
  );
}

export default function DMChat({ conversationId, currentUserId, otherUser }) {
  const { isLoaded, session } = useSession();
  const supabase = useClerkSupabase();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState(null);
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const remoteTypingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const isAtBottomRef = useRef(true);

  const mergeMessages = useCallback((previous, incoming) => {
    const byId = new Map(previous.map((message) => [message.id, message]));
    for (const message of incoming) {
      if (!message?.id) continue;
      if (message.client_id && byId.has(message.client_id)) {
        byId.delete(message.client_id);
      }
      const existing = byId.get(message.id);
      byId.set(message.id, { ...existing, ...message });
    }
    return [...byId.values()].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at) || a.id.localeCompare(b.id)
    );
  }, []);

  const scrollToBottom = useCallback((options = { behavior: "smooth" }) => {
    bottomRef.current?.scrollIntoView(options);
    setUnreadCount(0);
    isAtBottomRef.current = true;
  }, []);

  function handleScroll() {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    isAtBottomRef.current = isNearBottom;
    if (isNearBottom && unreadCount > 0) {
      setUnreadCount(0);
    }
  }

  const loadMessages = useCallback(
    async (before = null) => {
      const url = before
        ? `/api/community/direct/conversations/${conversationId}/messages?before=${encodeURIComponent(before)}`
        : `/api/community/direct/conversations/${conversationId}/messages`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    [conversationId]
  );

  useEffect(() => {
    loadMessages()
      .then((data) => {
        setMessages(data.messages || []);
        setHasMore(data.hasMore || false);
        setLoading(false);
        requestAnimationFrame(() => scrollToBottom({ behavior: "instant" }));
      })
      .catch(() => {
        setError("Failed to load messages.");
        setLoading(false);
      });
  }, [loadMessages, scrollToBottom]);

  // Realtime for DMs
  useEffect(() => {
    let cancelled = false;
    let retryTimeout = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;

    async function hydrateRealtimeMessage(messageId) {
      if (!messageId) return;
      const res = await fetch(
        `/api/community/direct/conversations/${conversationId}/messages?messageId=${encodeURIComponent(messageId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to hydrate realtime message");
      const data = await res.json();
      if (!cancelled && data.message) {
        setMessages((previous) => mergeMessages(previous, [{ ...data.message, status: "sent", optimistic: false }]));
      }
    }

    function receiveTyping(payload) {
      if (!payload || payload.userId === currentUserId) return;
      clearTimeout(remoteTypingTimeoutRef.current);
      setOtherIsTyping(Boolean(payload.isTyping));
      if (payload.isTyping) {
        remoteTypingTimeoutRef.current = setTimeout(() => setOtherIsTyping(false), 3000);
      }
    }

    async function subscribeToConversation() {
      if (!isLoaded || !session || !supabase || !conversationId) return;

      const token =
        (await session.getToken({ template: "supabase" }).catch(() => null)) ||
        (await session.getToken().catch(() => null));
      console.info(`[DM_CHAT_REALTIME] tokenPresent=${Boolean(token)}`);
      if (!token) {
        console.warn("[DM_CHAT_REALTIME] Missing Clerk session token");
        return;
      }

      await supabase.realtime.setAuth(token);
      if (cancelled) return;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channel = supabase
        .channel(`community-dm-messages-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "community_direct_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMsg = payload?.new;
            if (!newMsg?.id) return;
            const isOwn = newMsg.sender_id === currentUserId;

            if (isOwn) return;

            const baseMessage = {
              id: newMsg.id,
              sender_id: newMsg.sender_id,
              content: newMsg.is_deleted ? "[Message deleted]" : newMsg.content,
              is_deleted: Boolean(newMsg.is_deleted),
              created_at: newMsg.created_at,
              senderName: otherUser?.full_name || "Other",
              isOwn: false,
              status: "sent",
              optimistic: false,
            };

            setMessages((prev) => mergeMessages(prev, [baseMessage]));

            if (isAtBottomRef.current) {
              setTimeout(() => scrollToBottom({ behavior: "smooth" }), 20);
            } else {
              setUnreadCount((c) => c + 1);
            }

            hydrateRealtimeMessage(newMsg.id).catch(() => {});
          }
        )
        .on("broadcast", { event: "typing" }, (event) => {
          receiveTyping(event?.payload);
        })
        .subscribe((status, subscribeError) => {
          if (cancelled) return;
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn("[DM_CHAT_REALTIME_STATUS]", status, subscribeError);
            if (retryCount < MAX_RETRIES) {
              const delay = Math.min(1000 * 2 ** retryCount, 30000);
              retryCount += 1;
              retryTimeout = setTimeout(() => {
                if (!cancelled) subscribeToConversation();
              }, delay);
            }
          } else if (status === "SUBSCRIBED") {
            retryCount = 0;
          }
        });

      channelRef.current = channel;
    }

    subscribeToConversation();

    return () => {
      cancelled = true;
      clearTimeout(retryTimeout);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(remoteTypingTimeoutRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, currentUserId, isLoaded, mergeMessages, otherUser?.full_name, scrollToBottom, session, supabase]);

  function broadcastTyping(isTyping) {
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId, isTyping },
    });
  }

  function handleInputChange(event) {
    const value = event.target.value;
    setInput(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }

    if (!value.trim()) {
      clearTimeout(typingTimeoutRef.current);
      isTypingRef.current = false;
      broadcastTyping(false);
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      broadcastTyping(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      broadcastTyping(false);
    }, 2500);
  }

  async function loadOlderMessages() {
    if (!messages.length || loadingOlder) return;
    const container = messagesContainerRef.current;
    const prevScrollHeight = container ? container.scrollHeight : 0;
    const prevScrollTop = container ? container.scrollTop : 0;

    setLoadingOlder(true);
    try {
      const data = await loadMessages(messages[0]?.created_at);
      setMessages((prev) => mergeMessages(prev, data.messages || []));
      setHasMore(data.hasMore || false);

      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
        }
      });
    } catch {
      setError("Failed to load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  }

  async function sendPayload(tempId, content) {
    try {
      const res = await fetch(`/api/community/direct/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || !data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "failed", error: data?.error || "Failed to send" } : m))
        );
        return;
      }
      const confirmed = {
        ...data.message,
        client_id: tempId,
        status: "sent",
        optimistic: false,
      };
      setMessages((prev) => {
        const remaining = prev.filter((m) => m.id !== tempId);
        return mergeMessages(remaining, [confirmed]);
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed", error: "Network error" } : m))
      );
    }
  }

  function sendMessage(e) {
    if (e) e.preventDefault();
    const content = input.trim();
    if (!content) return;

    clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    broadcastTyping(false);

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticMsg = {
      id: tempId,
      client_id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
      is_deleted: false,
      created_at: new Date().toISOString(),
      senderName: "You",
      isOwn: true,
      status: "sending",
      optimistic: true,
    };

    setMessages((prev) => mergeMessages(prev, [optimisticMsg]));
    setTimeout(() => scrollToBottom({ behavior: "smooth" }), 10);

    sendPayload(tempId, content);
  }

  const handleRetry = useCallback(
    (failedMsg) => {
      if (!failedMsg?.id || !failedMsg?.content) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "sending", error: null } : m))
      );
      sendPayload(failedMsg.id, failedMsg.content);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId]
  );

  const handleDelete = useCallback((msgId) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, is_deleted: true, content: "[Message deleted]" } : m))
    );
  }, []);

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-[var(--surface)]">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white/95 px-4 py-3 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/community/messages"
            className="rounded-xl border border-stone-200 p-2 text-slate-500 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:text-white transition sm:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-brand to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-xs text-sm">
              {(otherUser?.full_name || "?")[0]?.toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[var(--surface)]" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              {otherUser?.full_name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {otherUser?.exam || "JEE"} · Target {otherUser?.target_year || "2026"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BlockReportMenu
            targetUserId={otherUser?.clerk_user_id}
            targetType="user"
            targetId={otherUser?.clerk_user_id}
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 scroll-smooth sm:px-6 bg-[#faf9f6]/80 dark:bg-[var(--background)]"
      >
        <div className="mx-auto w-full max-w-3xl space-y-1">
          {hasMore && (
            <div className="flex justify-center py-2">
              <button
                onClick={loadOlderMessages}
                disabled={loadingOlder}
                className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-500 shadow-xs transition-colors hover:border-brand/60 hover:text-slate-900 disabled:opacity-60 dark:border-white/10 dark:bg-[var(--surface-elevated)] dark:text-slate-400 dark:hover:text-white"
              >
                {loadingOlder ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" /> : <ChevronUp className="w-3.5 h-3.5 text-brand" />}
                Load older messages
              </button>
            </div>
          )}

          {loading ? (
            <DMSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[220px] text-slate-400">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10 shadow-xs">
                <Mail className="h-6 w-6 text-amber-600 dark:text-brand" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">Start the conversation</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Send a direct message to connect and study together.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const prev = messages[index - 1];
              const next = messages[index + 1];

              const prevTime = prev ? new Date(prev.created_at).getTime() : 0;
              const currTime = new Date(msg.created_at).getTime();
              const nextTime = next ? new Date(next.created_at).getTime() : 0;

              const prevDivider = prev ? getDateDividerLabel(prev.created_at) : null;
              const currDivider = getDateDividerLabel(msg.created_at);
              const dateDivider = currDivider !== prevDivider ? currDivider : null;

              const isSameSenderAsPrev = prev && prev.sender_id === msg.sender_id && currTime - prevTime < 5 * 60 * 1000 && !dateDivider;
              const isSameSenderAsNext = next && next.sender_id === msg.sender_id && nextTime - currTime < 5 * 60 * 1000 && getDateDividerLabel(next.created_at) === currDivider;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  currentUserId={currentUserId}
                  context="dm"
                  contextId={conversationId}
                  onDelete={handleDelete}
                  onRetry={handleRetry}
                  isFirstInGroup={!isSameSenderAsPrev}
                  isLastInGroup={!isSameSenderAsNext}
                  dateDivider={dateDivider}
                />
              );
            })
          )}

          {/* Typing indicator */}
          {otherIsTyping && (
            <div className="flex items-center gap-2 px-2 py-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1 rounded-full bg-slate-200/80 px-3 py-1 dark:bg-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 italic">{otherUser?.full_name || "Someone"} is typing…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Floating "New Messages" Pill */}
      {unreadCount > 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => scrollToBottom({ behavior: "smooth" })}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-black/20 hover:bg-slate-800 transition-all dark:bg-brand dark:text-slate-950 dark:hover:bg-brand-hover"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            <span>{unreadCount === 1 ? "New message" : `${unreadCount} new messages`}</span>
          </button>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input Composer */}
      <div className="sticky bottom-0 border-t border-stone-200 bg-white/95 px-3 py-3 backdrop-blur-md dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:px-6">
        <form
          onSubmit={sendMessage}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 sm:gap-3"
        >
          <div className="relative flex flex-1 items-center rounded-2xl border border-stone-200 bg-stone-50/70 p-1.5 transition-all focus-within:border-brand/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 dark:border-white/10 dark:bg-[var(--surface-elevated)]/70 dark:focus-within:border-brand/60 dark:focus-within:bg-[var(--surface-elevated)]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              maxLength={2000}
              rows={1}
              placeholder="Type a message…"
              className="max-h-32 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-1.5 text-sm leading-6 text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
              style={{ height: "auto" }}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            id="send-dm-message"
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-slate-950 shadow-xs transition-all hover:bg-brand-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4 stroke-[2.2]" />
          </button>
        </form>
        <div className="mx-auto max-w-3xl px-2 pt-1.5 hidden sm:flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
          <span>Press <strong>Enter ↵</strong> to send, <strong>Shift+Enter</strong> for newline</span>
          <span>Max 2000 characters</span>
        </div>
      </div>
    </div>
  );
}

