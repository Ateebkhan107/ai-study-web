"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ChevronUp } from "lucide-react";
import { useSession } from "@clerk/nextjs";
import MessageBubble from "./MessageBubble";
import { useClerkSupabase } from "@/lib/useClerkSupabase";

export default function GroupChat({ groupId, currentUserId, currentUserName }) {
  const { isLoaded, session } = useSession();
  const supabase = useClerkSupabase();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]); // array of names typing
  const bottomRef = useRef(null);
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const remoteTypingTimeoutsRef = useRef(new Map());
  const isTypingRef = useRef(false);

  const mergeMessages = useCallback((previous, incoming) => {
    const byId = new Map(previous.map((message) => [message.id, message]));
    for (const message of incoming) {
      if (!message?.id) continue;
      byId.set(message.id, { ...byId.get(message.id), ...message });
    }
    return [...byId.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, []);

  // Load initial messages
  const loadMessages = useCallback(async (before = null) => {
    try {
      const url = before
        ? `/api/community/groups/${groupId}/messages?before=${encodeURIComponent(before)}`
        : `/api/community/groups/${groupId}/messages`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      return data;
    } catch (err) {
      setError("Failed to load messages. Please refresh.");
      return null;
    }
  }, [groupId]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadMessages().then((data) => {
      if (data) {
        setMessages(data.messages || []);
        setHasMore(data.hasMore || false);
      }
      setLoading(false);
    });
  }, [loadMessages]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, loading]);

  // Supabase Realtime subscription (messages) + Presence (typing)
  useEffect(() => {
    let cancelled = false;
    let retryTimeout = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;
    const remoteTypingTimeouts = remoteTypingTimeoutsRef.current;

    async function hydrateRealtimeMessage(messageId) {
      const res = await fetch(`/api/community/groups/${groupId}/messages?messageId=${encodeURIComponent(messageId)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to hydrate realtime message");
      const data = await res.json();
      return data.message;
    }

    async function subscribeToGroup() {
      if (cancelled) return;
      if (!isLoaded || !session || !supabase) return;

      const token = await session.getToken().catch(() => null);
      console.info(`[GROUP_CHAT_REALTIME] token=${Boolean(token)}`);
      if (!token) {
        console.warn("[GROUP_CHAT_REALTIME] Missing Clerk session token");
        return;
      }

      await supabase.realtime.setAuth(token);
      if (cancelled) return;

      // Clean up existing channels
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      async function receiveMessage(messageId) {
        if (!messageId) return;
        try {
          const hydrated = await hydrateRealtimeMessage(messageId);
          if (cancelled || !hydrated) return;
          setMessages((prev) => mergeMessages(prev, [hydrated]));
        } catch (err) {
          console.warn("[GROUP_CHAT_REALTIME_HYDRATE]", err);
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
        }, 3500);
        remoteTypingTimeouts.set(userId, expiry);
      }

      // Message content is never trusted from Broadcast. Only the ID is sent,
      // then the authorized API hydrates the stored message for this member.
      const msgChannel = supabase
        .channel(`community-group-${groupId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "community_group_messages", filter: `group_id=eq.${groupId}` },
          ({ payload }) => {
            const newMsg = payload.new;
            if (!newMsg?.id) return;
            receiveMessage(newMsg.id);
          }
        )
        .on("broadcast", { event: "message_created" }, ({ payload }) => {
          receiveMessage(payload?.messageId);
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          receiveTyping(payload);
        })
        .subscribe((status) => {
          if (cancelled) return;
          console.info(`[GROUP_CHAT_REALTIME] status=${status}`);
          if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
            console.warn("[GROUP_CHAT_REALTIME_STATUS]", {
              groupId,
              status,
              channel: `community-group-${groupId}`,
            });
            if (retryCount < MAX_RETRIES) {
              const delay = Math.min(1000 * 2 ** retryCount, 30000);
              retryCount++;
              retryTimeout = setTimeout(() => {
                if (!cancelled) subscribeToGroup();
              }, delay);
            }
          } else if (status === "SUBSCRIBED") {
            retryCount = 0;
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
  }, [groupId, currentUserId, isLoaded, mergeMessages, session, supabase]);

  // Broadcast ephemeral typing state. A receiver-side expiry prevents stale UI
  // if a browser closes before it can send the final `false` event.
  function broadcastTyping(isTyping) {
    const channel = channelRef.current;
    if (!channel) return;
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId, name: currentUserName || "Someone", isTyping },
    });
  }

  async function broadcastMessageCreated(messageId) {
    if (!supabase || !messageId) return;
    const existingChannel = channelRef.current;
    const channel = existingChannel || supabase.channel(`community-group-${groupId}`);
    try {
      await channel.httpSend("message_created", { messageId, senderId: currentUserId });
    } catch (broadcastError) {
      console.warn("[GROUP_CHAT_BROADCAST_SEND]", broadcastError);
    } finally {
      if (!existingChannel) await supabase.removeChannel(channel);
    }
  }

  function handleInputChange(e) {
    const value = e.target.value;
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

    // Clear typing after 2 seconds of no keystrokes
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      broadcastTyping(false);
    }, 2000);
  }

  async function loadOlderMessages() {
    if (messages.length === 0 || loadingOlder) return;
    setLoadingOlder(true);
    const oldest = messages[0]?.created_at;
    const data = await loadMessages(oldest);
    if (data) {
      setMessages((prev) => mergeMessages(prev, data.messages || []));
      setHasMore(data.hasMore || false);
    }
    setLoadingOlder(false);
  }

  async function sendMessage(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content || isSubmitting) return;
    if (content.length > 2000) return;

    // Stop typing indicator immediately on send
    clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    broadcastTyping(false);

    setIsSubmitting(true);
    setInput("");

    try {
      const res = await fetch(`/api/community/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();

      if (!res.ok) {
        setInput(content);
        setError(data.error || "Failed to send.");
        return;
      }

      if (data.message) {
        setMessages((prev) => mergeMessages(prev, [data.message]));
        await broadcastMessageCreated(data.message.id);
      }
    } catch {
      setInput(content);
      setError("Network error. Message not sent.");
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
    <div className="flex h-full flex-col bg-[var(--card)]/60 dark:bg-[var(--background)]/30">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scroll-smooth sm:px-5">
        {/* Load older */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <button
              onClick={loadOlderMessages}
              disabled={loadingOlder}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-60"
            >
              {loadingOlder ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
              Load older messages
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
            <span className="text-3xl mb-2">💬</span>
            <p className="text-sm">No messages yet. Start the conversation!</p>
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
            />
          ))
        )}

        {/* Typing indicator */}
        {typingText && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex gap-0.5 items-end h-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">{typingText}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
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
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
          maxLength={2000}
          rows={1}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[var(--surface-elevated)]/60 border border-slate-200 dark:border-[var(--border)] text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 overflow-y-auto"
          style={{ height: "auto" }}
        />
        <button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          id="send-group-message"
          className="shrink-0 p-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
