"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ChevronUp, ChevronDown, MessageCircle, AlertCircle, WifiOff } from "lucide-react";
import { useSession } from "@clerk/nextjs";
import MessageBubble from "./MessageBubble";
import { useClerkSupabase } from "@/lib/useClerkSupabase";

function ChatSkeleton() {
  return (
    <div className="space-y-4 px-3 py-6 sm:px-6 animate-pulse">
      <div className="flex gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-44 rounded-xl rounded-bl-sm bg-slate-200/80 dark:bg-slate-800/80 sm:w-56" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-52 rounded-xl rounded-br-sm bg-brand/15 dark:bg-[var(--surface-elevated)] sm:w-64" />
      </div>
      <div className="flex gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-14 w-60 rounded-xl rounded-bl-sm bg-slate-200/80 dark:bg-slate-800/80 sm:w-80" />
        </div>
      </div>
    </div>
  );
}

export default function GroupChat({ groupId, currentUserId, currentUserName, onPresenceChange }) {
  const { isLoaded, session } = useSession();
  const supabase = useClerkSupabase();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connected"); // "connected" | "reconnecting"

  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const remoteTypingTimeoutsRef = useRef(new Map());
  const isTypingRef = useRef(false);
  const profileCacheRef = useRef(new Map());
  const isAtBottomRef = useRef(true);

  const mergeMessages = useCallback((previous, incoming) => {
    const byId = new Map(previous.map((message) => [message.id, message]));
    for (const message of incoming) {
      if (!message?.id) continue;
      // If incoming is a confirmed message with a client_id, remove the optimistic temp placeholder
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

  // Load initial messages
  const loadMessages = useCallback(
    async (before = null) => {
      try {
        const url = before
          ? `/api/community/groups/${groupId}/messages?before=${encodeURIComponent(before)}`
          : `/api/community/groups/${groupId}/messages`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        return data;
      } catch {
        setError("Failed to load messages. Please refresh.");
        return null;
      }
    },
    [groupId]
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadMessages().then((data) => {
      if (data) {
        (data.messages || []).forEach((m) => {
          if (m.sender_id && m.senderName && m.senderName !== "Unknown") {
            profileCacheRef.current.set(m.sender_id, m.senderName);
          }
        });
        setMessages(data.messages || []);
        setHasMore(data.hasMore || false);
      }
      setLoading(false);
      requestAnimationFrame(() => scrollToBottom({ behavior: "instant" }));
    });
  }, [loadMessages, scrollToBottom]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Supabase Realtime subscription (messages) + Presence (online & typing)
  useEffect(() => {
    let cancelled = false;
    let retryTimeout = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;
    const remoteTypingTimeouts = remoteTypingTimeoutsRef.current;

    async function hydrateRealtimeMessage(messageId) {
      const res = await fetch(
        `/api/community/groups/${groupId}/messages?messageId=${encodeURIComponent(messageId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to hydrate realtime message");
      const data = await res.json();
      return data.message;
    }

    async function subscribeToGroup() {
      if (cancelled) return;
      if (!isLoaded || !session || !supabase || !groupId) return;

      const token =
        (await session.getToken({ template: "supabase" }).catch(() => null)) ||
        (await session.getToken().catch(() => null));
      console.info(`[GROUP_CHAT_REALTIME] tokenPresent=${Boolean(token)}`);
      if (!token) {
        console.warn("[GROUP_CHAT_REALTIME] Missing Clerk session token");
        return;
      }

      await supabase.realtime.setAuth(token);
      if (cancelled) return;

      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      async function handleIncomingMessage(newMsg) {
        if (!newMsg?.id) return;
        const isOwn = newMsg.sender_id === currentUserId;

        const cachedName = profileCacheRef.current.get(newMsg.sender_id);
        const senderName = isOwn ? currentUserName || "You" : cachedName || "Member";

        const baseMessage = {
          id: newMsg.id,
          group_id: newMsg.group_id,
          sender_id: newMsg.sender_id,
          content: newMsg.is_deleted ? "[Message deleted]" : newMsg.content,
          is_deleted: Boolean(newMsg.is_deleted),
          created_at: newMsg.created_at,
          senderName,
          isOwn,
          status: "sent",
          optimistic: false,
        };

        setMessages((prev) => mergeMessages(prev, [baseMessage]));

        if (!isOwn) {
          if (isAtBottomRef.current) {
            setTimeout(() => scrollToBottom({ behavior: "smooth" }), 20);
          } else {
            setUnreadCount((c) => c + 1);
          }

          if (!cachedName) {
            try {
              const hydrated = await hydrateRealtimeMessage(newMsg.id);
              if (!cancelled && hydrated) {
                if (hydrated.senderName) {
                  profileCacheRef.current.set(newMsg.sender_id, hydrated.senderName);
                }
                setMessages((prev) => mergeMessages(prev, [hydrated]));
              }
            } catch (err) {
              console.warn("[GROUP_CHAT_REALTIME_HYDRATE]", err);
            }
          }
        }
      }

      function receiveTyping(payload) {
        const { userId, name, isTyping } = payload || {};
        if (!userId || userId === currentUserId) return;

        const existingTimeout = remoteTypingTimeouts.get(userId);
        if (existingTimeout) clearTimeout(existingTimeout);

        if (!isTyping) {
          remoteTypingTimeouts.delete(userId);
          setTypingUsers((previous) => previous.filter((user) => user.id !== userId));
          return;
        }

        setTypingUsers((previous) => {
          const remaining = previous.filter((user) => user.id !== userId);
          return [...remaining, { id: userId, name: name || "Someone" }];
        });

        const expiry = setTimeout(() => {
          remoteTypingTimeouts.delete(userId);
          setTypingUsers((previous) => previous.filter((user) => user.id !== userId));
        }, 3000);
        remoteTypingTimeouts.set(userId, expiry);
      }

      const msgChannel = supabase
        .channel(`community-group-messages-${groupId}`)
        .on("presence", { event: "sync" }, () => {
          const state = msgChannel.presenceState();
          const uniqueUsers = new Set();
          Object.values(state).forEach((presences) => {
            presences.forEach((p) => {
              if (p.userId) uniqueUsers.add(p.userId);
            });
          });
          const count = Math.max(1, uniqueUsers.size);
          if (onPresenceChange) onPresenceChange(count);
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "community_group_messages",
            filter: `group_id=eq.${groupId}`,
          },
          (payload) => {
            const newMsg = payload?.new;
            if (!newMsg?.id) return;
            handleIncomingMessage(newMsg);
          }
        )
        .on("broadcast", { event: "typing" }, (event) => {
          receiveTyping(event?.payload);
        })
        .subscribe(async (status, subscribeError) => {
          if (cancelled) return;
          console.info("[GROUP_CHAT_REALTIME_STATUS]", {
            groupId,
            status,
            error: subscribeError?.message ?? null,
          });

          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setConnectionStatus("reconnecting");
            if (retryCount < MAX_RETRIES) {
              const delay = Math.min(1000 * 2 ** retryCount, 30000);
              retryCount++;
              retryTimeout = setTimeout(() => {
                if (!cancelled) subscribeToGroup();
              }, delay);
            }
          } else if (status === "SUBSCRIBED") {
            setConnectionStatus("connected");
            retryCount = 0;
            await msgChannel
              .track({
                userId: currentUserId,
                name: currentUserName || "Member",
                onlineAt: new Date().toISOString(),
              })
              .catch(() => {});
          }
        });

      channelRef.current = msgChannel;
    }

    subscribeToGroup();

    return () => {
      cancelled = true;
      clearTimeout(retryTimeout);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      clearTimeout(typingTimeoutRef.current);
      for (const timeout of remoteTypingTimeouts.values()) clearTimeout(timeout);
      remoteTypingTimeouts.clear();
    };
  }, [currentUserId, currentUserName, groupId, isLoaded, mergeMessages, onPresenceChange, scrollToBottom, session, supabase]);

  // Broadcast ephemeral typing state
  function broadcastTyping(isTyping) {
    const channel = channelRef.current;
    if (!channel) return;
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId, name: currentUserName || "Someone", isTyping },
    });
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setInput(value);

    // Auto-grow textarea
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
    if (messages.length === 0 || loadingOlder) return;
    const container = messagesContainerRef.current;
    const prevScrollHeight = container ? container.scrollHeight : 0;
    const prevScrollTop = container ? container.scrollTop : 0;

    setLoadingOlder(true);
    const oldest = messages[0]?.created_at;
    const data = await loadMessages(oldest);
    if (data) {
      (data.messages || []).forEach((m) => {
        if (m.sender_id && m.senderName && m.senderName !== "Unknown") {
          profileCacheRef.current.set(m.sender_id, m.senderName);
        }
      });
      setMessages((prev) => mergeMessages(prev, data.messages || []));
      setHasMore(data.hasMore || false);

      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
        }
      });
    }
    setLoadingOlder(false);
  }

  async function sendPayload(tempId, content) {
    try {
      const res = await fetch(`/api/community/groups/${groupId}/messages`, {
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
    if (content.length > 2000) return;

    clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    broadcastTyping(false);

    // Clear input immediately and retain focus
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticMsg = {
      id: tempId,
      client_id: tempId,
      group_id: groupId,
      sender_id: currentUserId,
      content,
      is_deleted: false,
      created_at: new Date().toISOString(),
      senderName: currentUserName || "You",
      isOwn: true,
      status: "sending",
      optimistic: true,
    };

    setMessages((prev) => mergeMessages(prev, [optimisticMsg]));
    setTimeout(() => scrollToBottom({ behavior: "smooth" }), 10);

    // Send in background
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
    [groupId]
  );

  const handleDelete = useCallback((msgId) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, is_deleted: true, content: "[Message deleted]" } : m))
    );
  }, []);

  // Build typing text
  const typingText =
    typingUsers.length === 1
      ? `${typingUsers[0].name} is typing…`
      : typingUsers.length === 2
      ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing…`
      : typingUsers.length > 2
      ? "Several people are typing…"
      : null;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-slate-50/70 dark:bg-[var(--background)]">
      {/* Reconnecting banner */}
      {connectionStatus === "reconnecting" && (
        <div className="flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Reconnecting chat…</span>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 scroll-smooth sm:px-6"
      >
        {/* Load older */}
        {hasMore && (
          <div className="flex justify-center py-1">
            <button
              onClick={loadOlderMessages}
              disabled={loadingOlder}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-brand/50 hover:text-slate-900 disabled:opacity-60 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-400 dark:hover:text-white"
            >
              {loadingOlder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronUp className="w-3.5 h-3.5" />}
              Load older messages
            </button>
          </div>
        )}

        {loading ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[260px] items-center justify-center">
            <div className="max-w-sm rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-slate-500 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-400">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-brand/30 bg-brand/10">
                <MessageCircle className="h-6 w-6 text-brand" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">Start the conversation</p>
              <p className="mt-2 text-sm leading-6">
                Ask a doubt, share a mock-test plan, or post the chapter you are revising today.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              context="group"
              contextId={groupId}
              onDelete={handleDelete}
              onRetry={handleRetry}
            />
          ))
        )}

        {/* Typing indicator */}
        {typingText && (
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="flex gap-0.5 items-end h-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">{typingText}</p>
          </div>
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

      {/* Error banner */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="sticky bottom-0 flex items-end gap-2 border-t border-slate-200 bg-white px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:gap-3 sm:px-4"
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
          placeholder="Ask a doubt or share an update…"
          className="max-h-32 flex-1 resize-none overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-900 placeholder-slate-400 transition-colors focus:border-brand/60 focus:bg-white focus:outline-none dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/60 dark:text-white dark:focus:bg-[var(--surface-elevated)] sm:px-4"
          style={{ height: "auto" }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          id="send-group-message"
          aria-label="Send message"
          className="shrink-0 rounded-lg bg-brand p-2.5 text-black transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
