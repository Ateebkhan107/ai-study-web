"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ChevronUp, ShieldOff } from "lucide-react";
import { useSession } from "@clerk/nextjs";
import MessageBubble from "./MessageBubble";
import BlockReportMenu from "./BlockReportMenu";
import { useClerkSupabase } from "@/lib/useClerkSupabase";

export default function DMChat({ conversationId, currentUserId, otherUser }) {
  const { isLoaded, session } = useSession();
  const supabase = useClerkSupabase();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState(null);
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const remoteTypingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const mergeMessages = useCallback((previous, incoming) => {
    const byId = new Map(previous.map((message) => [message.id, message]));
    for (const message of incoming) {
      byId.set(message.id, { ...byId.get(message.id), ...message });
    }
    return [...byId.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, []);

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
      })
      .catch(() => {
        setError("Failed to load messages.");
        setLoading(false);
      });
  }, [loadMessages]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

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
        setMessages((previous) => mergeMessages(previous, [data.message]));
      }
    }

    function receiveTyping(payload) {
      if (!payload || payload.userId === currentUserId) return;
      clearTimeout(remoteTypingTimeoutRef.current);
      setOtherIsTyping(Boolean(payload.isTyping));
      if (payload.isTyping) {
        remoteTypingTimeoutRef.current = setTimeout(() => setOtherIsTyping(false), 3500);
      }
    }

    async function subscribeToConversation() {
      if (!isLoaded || !session || !supabase) return;

      const token = await session.getToken().catch(() => null);
      console.info(`[DM_CHAT_REALTIME] token=${Boolean(token)}`);
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
        .channel(`community-dm-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "community_direct_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMsg = payload.new;
            if (!newMsg?.id || newMsg.sender_id === currentUserId) return;
            hydrateRealtimeMessage(newMsg.id).catch((err) => {
              console.warn("[DM_CHAT_REALTIME_HYDRATE]", err);
              if (cancelled) return;
              setMessages((prev) =>
                mergeMessages(prev, [
                  {
                    id: newMsg.id,
                    sender_id: newMsg.sender_id,
                    content: newMsg.is_deleted ? "[Message deleted]" : newMsg.content,
                    is_deleted: newMsg.is_deleted,
                    created_at: newMsg.created_at,
                    senderName: otherUser?.full_name || "Other",
                    isOwn: false,
                  },
                ])
              );
            });
          }
        )
        .on("broadcast", { event: "message_created" }, ({ payload }) => {
          if (payload?.senderId !== currentUserId) {
            hydrateRealtimeMessage(payload?.messageId).catch((err) => {
              console.warn("[DM_CHAT_BROADCAST_HYDRATE]", err);
            });
          }
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          receiveTyping(payload);
        })
        .subscribe((status, subscribeError) => {
          if (cancelled) return;
          if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
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
  }, [conversationId, currentUserId, isLoaded, mergeMessages, otherUser?.full_name, session, supabase]);

  function broadcastTyping(isTyping) {
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId, isTyping },
    });
  }

  async function broadcastMessageCreated(messageId) {
    if (!supabase || !messageId) return;
    const existingChannel = channelRef.current;
    const channel = existingChannel || supabase.channel(`community-dm-${conversationId}`);
    try {
      await channel.httpSend("message_created", { messageId, senderId: currentUserId });
    } catch (broadcastError) {
      console.warn("[DM_CHAT_BROADCAST_SEND]", broadcastError);
    } finally {
      if (!existingChannel) await supabase.removeChannel(channel);
    }
  }

  function handleInputChange(event) {
    const value = event.target.value;
    setInput(value);

    if (!value) {
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
    }, 2000);
  }

  async function loadOlderMessages() {
    if (!messages.length || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const data = await loadMessages(messages[0]?.created_at);
      setMessages((prev) => mergeMessages(prev, data.messages || []));
      setHasMore(data.hasMore || false);
    } catch {
      setError("Failed to load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content || isSubmitting) return;

    clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    broadcastTyping(false);

    setIsSubmitting(true);
    const optimisticId = `opt-${Date.now()}`;
    setMessages((prev) => mergeMessages(prev, [
      {
        id: optimisticId,
        sender_id: currentUserId,
        content,
        is_deleted: false,
        created_at: new Date().toISOString(),
        senderName: "You",
        isOwn: true,
        optimistic: true,
      },
    ]));
    setInput("");

    try {
      const res = await fetch(`/api/community/direct/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setInput(content);
        setError(data.error || "Failed to send.");
        return;
      }
      setMessages((prev) =>
        mergeMessages(prev.filter((m) => m.id !== optimisticId), [{ ...data.message, optimistic: false }])
      );
      await broadcastMessageCreated(data.message.id);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInput(content);
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(msgId) {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, is_deleted: true, content: "[Message deleted]" } : m))
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--card)]/60 dark:bg-[var(--background)]/30">
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
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 sm:px-5">
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

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <span className="text-3xl mb-2">✉️</span>
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
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

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
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
          }}
          maxLength={2000}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[var(--surface-elevated)]/60 border border-slate-200 dark:border-[var(--border)] text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 overflow-y-auto"
        />
        <button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          id="send-dm-message"
          className="shrink-0 p-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
