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
  const bottomRef = useRef(null);

  function mergeMessages(previous, incoming) {
    const byId = new Map(previous.map((message) => [message.id, message]));
    for (const message of incoming) {
      byId.set(message.id, { ...byId.get(message.id), ...message });
    }
    return [...byId.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
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
    let channel;
    let cancelled = false;
    const otherName = otherUser?.full_name || "Other";

    async function subscribeToConversation() {
      if (!isLoaded || !session || !supabase) return;

      const token = await session.getToken().catch(() => null);
      if (!token) {
        console.warn("[DM_CHAT_REALTIME] Missing Clerk session token");
        return;
      }

      await supabase.realtime.setAuth(token);
      if (cancelled) return;

      channel = supabase
        .channel(`dm-${conversationId}`)
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
            setMessages((prev) => {
              if (newMsg.sender_id === currentUserId) return prev;
              return mergeMessages(prev, [
                {
                  id: newMsg.id,
                  sender_id: newMsg.sender_id,
                  content: newMsg.is_deleted ? "[Message deleted]" : newMsg.content,
                  is_deleted: newMsg.is_deleted,
                  created_at: newMsg.created_at,
                  senderName: otherName,
                  isOwn: false,
                },
              ]);
            });
          }
        )
        .subscribe();
    }

    subscribeToConversation();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, isLoaded, otherUser?.full_name, session, supabase]);

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
    <div className="flex h-full flex-col bg-white/60 dark:bg-slate-950/30">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold">
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

      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="sticky bottom-0 border-t border-slate-200 bg-white/90 px-3 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 flex items-end gap-3 sm:px-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
          }}
          maxLength={2000}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 overflow-y-auto"
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
