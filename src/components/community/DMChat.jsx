"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ChevronUp, ChevronDown, Mail } from "lucide-react";
import { useSession } from "@clerk/nextjs";
import MessageBubble from "./MessageBubble";
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
    <div className="relative flex h-full flex-col bg-[var(--card)]/60 dark:bg-[var(--background)]/30">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-brand-hover flex items-center justify-center text-white font-bold">
            {(otherUser?.full_name || "?")[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-white">
              {otherUser?.full_name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {otherUser?.exam} · Target {otherUser?.target_year}
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
        className="flex-1 overflow-y-auto px-3 py-4 space-y-2 sm:px-5 scroll-smooth"
      >
        {hasMore && (
          <div className="flex justify-center py-2">
            <button
              onClick={loadOlderMessages}
              disabled={loadingOlder}
              className="flex items-center gap-1.5 text-xs text-indigo-500 hover:underline disabled:opacity-60"
            >
              {loadingOlder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronUp className="w-3.5 h-3.5" />}
              Load older messages
            </button>
          </div>
        )}

        {loading ? (
          <DMSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Mail className="mb-2 h-8 w-8" />
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              context="dm"
              contextId={conversationId}
              onDelete={handleDelete}
              onRetry={handleRetry}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Floating "New Messages" Pill */}
      {unreadCount > 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => scrollToBottom({ behavior: "smooth" })}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 dark:bg-brand dark:text-black"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            <span>{unreadCount === 1 ? "New message" : `${unreadCount} new messages`}</span>
          </button>
        </div>
      )}

      {otherIsTyping && (
        <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2 dark:border-[var(--border-subtle)]">
          <div className="flex gap-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
          </div>
          <p className="text-xs italic text-slate-400">{otherUser?.full_name || "Someone"} is typing…</p>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="sticky bottom-0 border-t border-slate-200 bg-[var(--card)]/90 px-3 py-3 backdrop-blur dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/90 flex items-end gap-3 sm:px-4"
      >
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
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[var(--surface-elevated)]/60 border border-slate-200 dark:border-[var(--border)] text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 overflow-y-auto"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          id="send-dm-message"
          aria-label="Send message"
          className="shrink-0 p-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
