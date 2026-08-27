"use client";

import Link from "next/link";
import { useState } from "react";
import { Users, Lock, Globe, Loader2, CheckCircle, ArrowRight, UserPlus, BookOpen } from "lucide-react";

// Simple string hasher for pseudo-random visual stability
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Gradients for the Group Identity logo
const GRADIENTS = [
  "from-amber-400 to-rose-500",
  "from-violet-500 to-fuchsia-500",
  "from-emerald-400 to-cyan-500",
  "from-blue-500 to-indigo-600",
  "from-rose-400 to-orange-500",
  "from-indigo-400 to-purple-600",
  "from-teal-400 to-emerald-600",
  "from-pink-500 to-rose-600",
];

// Gradients for the mock user avatars
const AVATAR_GRADIENTS = [
  "from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700",
  "from-amber-200 to-amber-400 dark:from-amber-600 dark:to-amber-800",
  "from-sky-300 to-blue-400 dark:from-sky-700 dark:to-blue-900",
  "from-rose-300 to-pink-400 dark:from-rose-700 dark:to-pink-900",
  "from-emerald-300 to-teal-400 dark:from-emerald-700 dark:to-teal-900",
];

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
  const actionLabel = myRole === "OWNER" || myRole === "ADMIN" ? "Manage" : "Open";
  const memberCount = group.member_count ?? 0;
  const isHighlyActive = memberCount >= 20;

  const initials = (group.name || "Study Group")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "SG";
  
  const hash = hashCode(group.name || group.id || "123");
  const gradient = GRADIENTS[hash % GRADIENTS.length];

  // Visual stack of avatars up to 4
  const avatarCount = Math.min(4, Math.max(1, memberCount));

  return (
    <div className={`relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]/85 ${isHighlyActive ? "ring-1 ring-brand/30 shadow-brand/5 dark:shadow-brand/5" : ""}`}>
      
      {/* Active Indicator Glow */}
      {isHighlyActive && (
        <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </div>
      )}

      {/* Header: Identity & Title */}
      <div className="flex items-start gap-4">
        {/* Abstract Identity Block */}
        <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${gradient} shadow-inner`}>
          <span className="relative z-10 text-lg font-black font-display text-white drop-shadow-md tracking-tighter">
            {initials}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-black tracking-tight text-slate-950 dark:text-white leading-tight">
              {group.name}
            </h3>
            {/* Privacy Badge */}
            <span
              className={`shrink-0 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
                isPublic
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {isPublic ? "Public" : "Private"}
            </span>
          </div>
          
          {group.exam_track && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-brand">
              <BookOpen className="h-3 w-3" />
              {group.exam_track} STUDY GROUP
            </div>
          )}
        </div>
      </div>
      
      {group.description && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-400 flex-1">
          {group.description}
        </p>
      )}

      {error && <p className="mt-3 text-xs font-bold text-red-500">{error}</p>}

      {/* Footer: Avatars & Action */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-4 dark:border-[var(--border-subtle)]">
        
        {/* Overlapping Avatar Stack */}
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="flex -space-x-2.5">
            {Array.from({ length: avatarCount }).map((_, index) => {
              const avatarHash = hashCode(`${group.id}-avatar-${index}`);
              const avatarGrad = AVATAR_GRADIENTS[avatarHash % AVATAR_GRADIENTS.length];
              return (
                <div
                  key={index}
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr ${avatarGrad} shadow-sm dark:border-[var(--surface)]`}
                />
              );
            })}
            {memberCount > avatarCount && (
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 dark:bg-slate-800 dark:border-[var(--surface)] shadow-sm">
                <span className="text-[9px] font-black text-slate-600 dark:text-slate-400">+{memberCount - avatarCount}</span>
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        {/* Action Button */}
        {isActiveMember || joined ? (
          <Link
            href={`/community/groups/${group.id}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-black text-slate-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform" />
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
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 dark:border-[var(--border-subtle)] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-[var(--surface-elevated)]/50"
          >
            {joining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isPublic ? (
              <>Join <ArrowRight className="h-3.5 w-3.5" /></>
            ) : (
              <><UserPlus className="h-3.5 w-3.5" /> Request</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
