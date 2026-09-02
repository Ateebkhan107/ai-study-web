"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, MessageSquare, Loader2, Clock } from "lucide-react";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function DMInbox({ currentUserId }) {
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Conversations");

  useEffect(() => {
    async function load() {
      try {
        const [reqRes, convRes] = await Promise.all([
          fetch("/api/community/direct/requests"),
          fetch("/api/community/direct/conversations"),
        ]);
        const [reqData, convData] = await Promise.all([reqRes.json(), convRes.json()]);
        setRequests(reqData.requests || []);
        setConversations(convData.conversations || []);
      } catch {
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function respond(convId, action) {
    setProcessing((p) => ({ ...p, [convId]: true }));
    try {
      const res = await fetch(`/api/community/direct/requests/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== convId));
        if (action === "ACTIVE") {
          // Re-fetch conversations
          const convRes = await fetch("/api/community/direct/conversations");
          const convData = await convRes.json();
          setConversations(convData.conversations || []);
        }
      }
    } catch {
      setError("Failed to respond.");
    } finally {
      setProcessing((p) => ({ ...p, [convId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">{error}</p>
      )}

      {/* Tabs */}
      <div className="inline-flex rounded-2xl bg-stone-100/80 p-1 dark:bg-[var(--surface-elevated)]">
        {["Conversations", "Message Requests"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              activeTab === tab
                ? "bg-white text-slate-950 shadow-xs dark:bg-brand dark:text-slate-950"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {tab}{tab === "Message Requests" && requests.length > 0 ? ` (${requests.length})` : ""}
          </button>
        ))}
      </div>

      {activeTab === "Message Requests" && (
        <section>
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-slate-400 dark:border-white/10 dark:bg-[var(--surface)]">
              <p className="text-sm font-semibold">No pending message requests.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[var(--surface)] flex items-center justify-between gap-3 transition-all hover:border-brand/40"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-brand to-amber-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-xs">
                      {(req.requesterProfile?.full_name || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {req.requesterProfile?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {req.requesterProfile?.exam || "JEE"} · Target {req.requesterProfile?.target_year || "2026"}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                        <Clock className="w-3 h-3 text-amber-500" /> {formatDate(req.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {processing[req.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    ) : (
                      <>
                        <button
                          onClick={() => respond(req.id, "DECLINED")}
                          title="Decline"
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => respond(req.id, "ACTIVE")}
                          title="Accept"
                          className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "Conversations" && (
        <section>
          {conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-slate-400 dark:border-white/10 dark:bg-[var(--surface)]">
              <p className="text-sm font-semibold">No active conversations yet.</p>
              <p className="text-xs text-slate-400 mt-1">Visit study groups or community member profiles to start messaging.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/community/messages/${conv.id}`}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[var(--surface)] flex items-center gap-3.5 hover:border-brand/50 hover:shadow-sm transition-all"
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-brand to-amber-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-xs">
                      {(conv.otherUser?.full_name || "?")[0]?.toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[var(--surface)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {conv.otherUser?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {conv.otherUser?.exam || "JEE"} · Target {conv.otherUser?.target_year || "2026"}
                    </p>
                  </div>
                  <MessageSquare className="w-4 h-4 text-amber-500/70 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
