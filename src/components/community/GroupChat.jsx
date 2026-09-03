"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import { useSession } from "@clerk/nextjs";
import MessageBubble, { getDateDividerLabel } from "./MessageBubble";
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

function GroupChat({ groupId, currentUserId, currentUserName, onPresenceChange }) {
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
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scroll-smooth sm:px-6 bg-[#faf9f6]/80 dark:bg-[var(--background)]"
      >
        <div className="mx-auto w-full max-w-3xl space-y-1">
          {/* Load older */}
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
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex h-full min-h-[260px] items-center justify-center">
              <div className="max-w-sm rounded-2xl border border-dashed border-stone-300 bg-white p-6 sm:p-8 text-center text-slate-500 shadow-xs dark:border-white/10 dark:bg-[var(--surface-elevated)] dark:text-slate-400">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10 shadow-xs">
                  <MessageCircle className="h-6 w-6 text-amber-600 dark:text-brand" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white">Start the conversation</p>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Ask a doubt, share a study schedule, or post a question you solved today.
                </p>
              </div>
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
                  context="group"
                  contextId={groupId}
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
          {typingText && (
            <div className="flex items-center gap-2 px-2 py-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1 rounded-full bg-slate-200/80 px-3 py-1 dark:bg-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 italic">{typingText}</span>
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

      {/* Error banner */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
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
              placeholder="Ask a doubt or share an update…"
              className="max-h-32 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-1.5 text-sm leading-6 text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
              style={{ height: "auto" }}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            id="send-group-message"
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

export default memo(GroupChat);
