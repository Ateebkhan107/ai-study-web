"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Users } from "lucide-react";

export default function JoinRequestsPanel({ groupId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/community/groups/${groupId}/requests?status=PENDING`)
      .then((r) => r.json())
      .then((data) => {
        setRequests(data.requests || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load requests.");
        setLoading(false);
      });
  }, [groupId]);

  async function reviewRequest(requestId, action) {
    setProcessing((p) => ({ ...p, [requestId]: true }));
    try {
      const res = await fetch(`/api/community/groups/${groupId}/requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        const d = await res.json();
        setError(d.error || "Failed to update request.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setProcessing((p) => ({ ...p, [requestId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-indigo-500" />
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
          Join Requests ({requests.length})
        </h3>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
      )}

      {requests.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
          No pending join requests.
        </p>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {req.requester?.full_name || "Unknown"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {req.requester?.exam} · Target {req.requester?.target_year}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => reviewRequest(req.id, "REJECTED")}
                  disabled={processing[req.id]}
                  title="Reject"
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                >
                  {processing[req.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => reviewRequest(req.id, "ACCEPTED")}
                  disabled={processing[req.id]}
                  title="Accept"
                  className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-40"
                >
                  {processing[req.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
