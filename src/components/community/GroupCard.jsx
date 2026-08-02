"use client";

import Link from "next/link";
import { useState } from "react";
import { Users, Lock, Globe, Loader2, CheckCircle } from "lucide-react";

export default function GroupCard({ group, myRole, myStatus, onJoin }) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState(null);

  const isActiveMember = myRole && myStatus === "ACTIVE";
  const isPending = myStatus === null && requestSent;

  async function handleJoin(e) {
    e.preventDefault();
    if (joining || isActiveMember) return;
    setJoining(true);
    setError(null);

    try {
      const res = await fetch(`/api/community/groups/${group.id}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join.");
        return;
      }
      if (data.status === "joined") setJoined(true);
      if (data.status === "requested") setRequestSent(true);
      if (onJoin) onJoin(group.id, data.status);
    } catch {
      setError("Network error.");
    } finally {
      setJoining(false);
    }
  }

  const isPublic = group.privacy === "PUBLIC";

  return (
    <div className="glass-card p-5 flex flex-col gap-3 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{group.name}</h3>
            <span
              className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                isPublic
                  ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }`}
            >
              {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isPublic ? "Public" : "Private"}
            </span>
          </div>
          {group.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{group.description}</p>
          )}
        </div>
      </div>

      {/* Member count */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Users className="w-3.5 h-3.5" />
        <span>{group.member_count ?? 1} member{(group.member_count ?? 1) !== 1 ? "s" : ""}</span>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Action */}
      {isActiveMember || joined ? (
        <Link
          href={`/community/groups/${group.id}`}
          className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold text-center hover:bg-indigo-700 transition-colors"
        >
          {myRole === "OWNER" ? "Manage" : myRole === "ADMIN" ? "Admin" : "Open Chat"}
        </Link>
      ) : isPending || myStatus === "PENDING" ? (
        <div className="w-full py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Request Sent
        </div>
      ) : (
        <button
          onClick={handleJoin}
          disabled={joining}
          id={`join-group-${group.id}`}
          className="w-full py-2 rounded-xl border border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          {joining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPublic ? (
            "Join Group"
          ) : (
            "Request to Join"
          )}
        </button>
      )}
    </div>
  );
}
