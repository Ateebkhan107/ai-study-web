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
  const actionLabel = myRole === "OWNER" ? "Manage" : myRole === "ADMIN" ? "Manage" : "Open";

  return (
    <div className="rounded-xl border border-slate-200/80 bg-[var(--card)]/85 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/70 dark:hover:border-indigo-500/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">{group.name}</h3>
          {group.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500 dark:text-slate-400">{group.description}</p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
            isPublic
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          }`}
        >
          {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {isPublic ? "Public" : "Private"}
        </span>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Users className="h-3.5 w-3.5" />
          <span>{group.member_count ?? 0}</span>
        </div>

        {isActiveMember || joined ? (
          <Link
            href={`/community/groups/${group.id}`}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
          >
            {actionLabel}
          </Link>
        ) : isPending || myStatus === "PENDING" ? (
          <div className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <CheckCircle className="w-3.5 h-3.5" /> Requested
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            id={`join-group-${group.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-60 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
        >
            {joining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPublic ? "Join" : "Request"}
          </button>
        )}
      </div>
    </div>
  );
}
