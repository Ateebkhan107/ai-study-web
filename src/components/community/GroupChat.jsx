"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ChevronUp } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { supabase } from "@/lib/supabase";

export default function GroupChat({ groupId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);

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

  useEffect(() => {
    loadMessages().then((data) => {
      if (data) {
        setMessages(data.messages || []);
        setHasMore(data.hasMore || false);
      }
      setLoading(false);
    });
  }, [loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, loading]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_group_messages", filter: `group_id=eq.${groupId}` },
        (payload) => {
          const newMsg = payload.new;
          // Prevent duplicate: skip if sender is current user (optimistic already shown)
          setMessages((prev) => {
            const isDuplicate = prev.some((m) => m.id === newMsg.id);
            if (isDuplicate) return prev;
            // Don't add own messages via realtime — they're already optimistically shown
            if (newMsg.sender_id === currentUserId) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                sender_id: newMsg.sender_id,
                content: newMsg.is_deleted ? "[Message deleted]" : newMsg.content,
                is_deleted: newMsg.is_deleted,
                created_at: newMsg.created_at,
                senderName: "Loading…",
                isOwn: false,
              },
            ];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, currentUserId]);

  async function loadOlderMessages() {
    if (messages.length === 0 || loadingOlder) return;
    setLoadingOlder(true);
    const oldest = messages[0]?.created_at;
    const data = await loadMessages(oldest);
    if (data) {
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore || false);
    }
    setLoadingOlder(false);
  }

  async function sendMessage(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content || isSubmitting) return;
    if (content.length > 2000) return;

    setIsSubmitting(true);

    // Optimistic message
    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId,
      sender_id: currentUserId,
      content,
      is_deleted: false,
      created_at: new Date().toISOString(),
      senderName: "You",
      isOwn: true,
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");

    try {
      const res = await fetch(`/api/community/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Rollback optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setInput(content);
        setError(data.error || "Failed to send.");
        return;
      }

      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? { ...data.message, optimistic: false } : m))
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scroll-smooth">
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
        className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-end gap-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
          maxLength={2000}
          rows={1}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 overflow-y-auto"
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
