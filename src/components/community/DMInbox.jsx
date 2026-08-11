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
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>
      )}

      <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70">
        {["Conversations", "Message Requests"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              activeTab === tab
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {tab}{tab === "Message Requests" ? ` (${requests.length})` : ""}
          </button>
        ))}
      </div>

      {activeTab === "Message Requests" && (
        <section>
          {requests.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">No pending requests.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold shrink-0">
                    {(req.requesterProfile?.full_name || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {req.requesterProfile?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {req.requesterProfile?.exam} · Target {req.requesterProfile?.target_year}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDate(req.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {processing[req.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  ) : (
                    <>
                      <button
                        onClick={() => respond(req.id, "DECLINED")}
                        title="Decline"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => respond(req.id, "ACTIVE")}
                        title="Accept"
                        className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
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
            <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">No active conversations.</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/community/messages/${conv.id}`}
                className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 flex items-center gap-3 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                  {(conv.otherUser?.full_name || "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {conv.otherUser?.full_name || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {conv.otherUser?.exam} · Target {conv.otherUser?.target_year}
                  </p>
                </div>
                <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
              </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
