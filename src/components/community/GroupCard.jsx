"use client";

import Link from "next/link";
import { useState } from "react";
import { Users, Lock, Globe, Loader2, CheckCircle, ArrowRight } from "lucide-react";

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
  const memberCount = group.member_count ?? 0;
  const initials = (group.name || "Study Group")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "SG";
  const avatarCount = Math.min(3, Math.max(1, memberCount));
  const accentClass = !isPublic
    ? "border-l-amber-400/80"
    : memberCount >= 20
      ? "border-l-brand"
      : "border-l-slate-300 dark:border-l-slate-700";

  return (
    <div className={`group rounded-xl border border-l-4 border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/85 dark:hover:border-slate-700 ${accentClass}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-black text-slate-800 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-normal text-slate-950 dark:text-white">{group.name}</h3>
            <span
              className={`shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${
                isPublic
                  ? "border-slate-200 bg-slate-50 text-slate-600 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-300"
                  : "border-amber-300/70 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
              }`}
            >
              {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {isPublic ? "Public" : "Private"}
            </span>
          </div>
          {group.description && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{group.description}</p>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3 dark:border-[var(--border-subtle)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex -space-x-2">
              {Array.from({ length: avatarCount }).map((_, index) => (
                <span
                  key={index}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-black text-slate-600 dark:border-[var(--surface)] dark:bg-[var(--surface-elevated)] dark:text-slate-300"
                >
                  {index === 0 ? initials[0] : index + 1}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          {group.exam_track && (
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              {group.exam_track} Study Group
            </p>
          )}
        </div>

        {isActiveMember || joined ? (
          <Link
            href={`/community/groups/${group.id}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : isPending || myStatus === "PENDING" ? (
          <div className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <CheckCircle className="w-3.5 h-3.5" /> Requested
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            id={`join-group-${group.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-brand/60 hover:bg-brand/10 hover:text-slate-950 disabled:opacity-60 dark:border-[var(--border)] dark:text-slate-200 dark:hover:border-brand/50 dark:hover:text-white"
        >
            {joining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPublic ? "Join" : "Request"}
          </button>
        )}
      </div>
    </div>
  );
}
