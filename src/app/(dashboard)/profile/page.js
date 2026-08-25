"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  CircleCheck,
  Clock,
  Crown,
  Flame,
  GraduationCap,
  Medal,
  Pencil,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { getLevelFromXP } from "@/utils/levelEngine";
import PageWrapper from "@/components/PageWrapper";

const BADGE_ICONS = {
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  CircleCheck,
  Clock,
  Crown,
  Flame,
  GraduationCap,
  Medal,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
};



export default function ProfilePage() {
  const { user: clerkUser } = useUser();

  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [rank, setRank] = useState(null);

  const [dynamicBadges, setDynamicBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editExam, setEditExam] = useState("JEE");
  const [editYear, setEditYear] = useState(2026);
  const [saved, setSaved] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear + i);

  // LOAD PROFILE
  useEffect(() => {
    async function fetchLiveProfile() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setXpData({
            xp: data.xp || 0,
            level: data.level || 1,
            badge: data.badge || "Explorer",
            progress: data.progress || 0,
            streak: data.streak || 0,
          });
          setRank(data.rank ?? null);
          setEditName(data.full_name || clerkUser?.fullName || "Student");
          setEditExam(data.current_track?.toUpperCase() || "JEE");
          setEditYear(data.target_year || 2026);
        }
      } catch (error) {
        console.error("Profile loading failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveProfile();
  }, [clerkUser]);

  // LOAD XP PROFILE & ANALYTICS
  useEffect(() => {
    if (!clerkUser) return;
    async function loadStats() {
      try {
        const badgeRes = await fetch("/api/profile/badges");
        if (badgeRes.ok) {
          const dbBadges = await badgeRes.json();
          if (Array.isArray(dbBadges)) {
            setDynamicBadges(dbBadges);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch badges", err);
      }
    }
    loadStats();
  }, [clerkUser, editExam]);

  // CHANGE TRACK (JEE / NEET toggle)
  const handleTrackToggle = async (newExam) => {
    const currentActiveTrack = user?.current_track || "jee";
    if (newExam.toLowerCase() === currentActiveTrack.toLowerCase()) return;

    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `prepzii_track=${newExam.toLowerCase()}; path=/; max-age=31536000; SameSite=Lax;`;

    setUser((prev) => ({
      ...prev,
      current_track: newExam.toLowerCase(),
    }));

    setEditExam(newExam);
    setSaved(true);

    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_track: newExam.toLowerCase() }),
      });
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setSaved(false);
    }, 1000);
  };

  // SAVE PROFILE (from edit modal)
  const handleSave = async () => {
    setUser((prev) => ({
      ...prev,
      full_name: editName,
      current_track: editExam.toLowerCase(),
      target_year: editYear,
    }));

    document.cookie = `prepzii_track=${editExam.toLowerCase()}; path=/; max-age=31536000; SameSite=Lax;`;

    setEditing(false);
    setSaved(true);

    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editName,
          current_track: editExam.toLowerCase(),
          target_year: editYear,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <PageWrapper title="Profile" badge="ACCOUNT">
        <div className="space-y-6">
          <div className="h-10 w-32 rounded-xl skeleton-shimmer" />
          <div className="h-44 rounded-3xl skeleton-shimmer" />
          <div className="h-36 rounded-3xl skeleton-shimmer" />
          <div className="h-48 rounded-3xl skeleton-shimmer" />
        </div>
      </PageWrapper>
    );
  }

  const activeUser = {
    name: user?.full_name || clerkUser?.fullName || "Student",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "No email",
    avatar: clerkUser?.hasImage ? clerkUser.imageUrl : null,
    exam: user?.current_track?.toUpperCase() || "JEE",
    targetYear: user?.target_year || 2026,
    xp: xpData?.xp || 0,
    level: xpData?.level || 1,
    badge: xpData?.badge || "Explorer",
    progress: xpData?.xp || 0,
    streak: xpData?.streak || 0,
    rank: rank,
  };

  const badgeDefs = dynamicBadges;
  const earnedCount = badgeDefs.filter((b) => b.earned).length;
  const levelStats = getLevelFromXP(activeUser.xp);

  return (
    <PageWrapper
      title="Profile"
      subtitle="Manage your account and track progress"
      badge="ACCOUNT"
    >
      {/* ── PROFILE CARD ── */}
      <section className="animate-slideUp" style={{ animationDelay: "75ms" }}>
        <div className="glass-card relative overflow-hidden p-4 shadow-sm sm:p-6">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand/8 via-brand/5 to-transparent dark:from-brand/10 dark:via-brand/6 dark:to-transparent rounded-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              {/* AVATAR */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-2xl font-black text-white shadow-[0_0_25px_rgba(194,114,63,0.2)] ring-2 ring-indigo-500/40 dark:bg-indigo-500 dark:text-white dark:ring-indigo-400/40 sm:h-20 sm:w-20 sm:text-3xl">
                {activeUser.avatar ? (
                  <img
                    src={activeUser.avatar}
                    alt="profile"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  activeUser.name.charAt(0)
                )}
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                  {activeUser.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:gap-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold">
                    {activeUser.exam} Focus
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    Target {activeUser.targetYear}
                  </span>
                </div>

                {/* JEE / NEET TOGGLE */}
                <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-[var(--surface-elevated)]">
                  {["JEE", "NEET"].map((trackOption) => {
                    const isActive = activeUser.exam === trackOption;
                    return (
                      <button
                        key={trackOption}
                        onClick={() => handleTrackToggle(trackOption)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 sm:px-4 ${
                          isActive
                            ? "bg-brand text-white"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        {trackOption}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full justify-center border border-slate-200 dark:border-[var(--border)] px-4 py-2 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 flex items-center gap-2 sm:w-auto"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* ── XP CARD ── */}
      <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
        <div className="glass-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* BADGE */}
              <div className="min-h-14 min-w-0 px-4 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-brand/20 sm:min-w-[120px]">
                {levelStats.title}
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Level {levelStats.currentLevel}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {levelStats.totalXP.toLocaleString()} / {levelStats.nextLevelXP.toLocaleString()} XP
                </p>
                {activeUser.rank && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Global Rank #{activeUser.rank}
                  </p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Next level
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {levelStats.xpRemaining.toLocaleString()} XP away
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-2.5 bg-slate-200 dark:bg-[var(--surface-elevated)] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-brand rounded-full transition-all relative overflow-hidden"
              style={{
                width: `${levelStats.progressPercentage}%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </section>



      {/* ── BADGES ── */}
      <section className="animate-slideUp" style={{ animationDelay: "275ms" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black tracking-widest text-xs text-slate-800 dark:text-slate-100 uppercase">
            BADGES
          </h3>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {earnedCount}/{badgeDefs.length} earned
          </span>
        </div>

        <div className="glass-card p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
            {badgeDefs.map((badge, index) => {
              const IconComponent = BADGE_ICONS[badge.iconName] || Award;
              return (
              <div
                key={index}
                className={`relative flex min-h-[116px] flex-col items-center justify-center overflow-hidden rounded-2xl border p-3 text-center transition-all duration-300 sm:min-h-[140px] sm:p-4 ${
                  badge.earned
                    ? "bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-indigo-100 dark:border-indigo-500/20 shadow-sm hover:shadow-md hover:-translate-y-1"
                    : "bg-slate-50/50 dark:bg-[var(--surface)]/50 border-slate-100 dark:border-[var(--border-subtle)] grayscale-[0.8] opacity-60"
                }`}
              >
                {badge.earned && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-brand" />
                )}
                
                <div className={`mb-3 transition-transform duration-300 ${badge.earned ? "scale-110" : ""}`}>
                  <IconComponent className={`w-8 h-8 ${badge.color || 'text-slate-500'}`} />
                </div>
                
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {badge.title}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {badge.detail}
                </p>
                {badge.earned && (
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl" />
                )}
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* ── SIGN OUT ── */}
      <section className="animate-slideUp pt-2" style={{ animationDelay: "350ms" }}>
        <SignOutButton>
          <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300">
            Sign Out
          </button>
        </SignOutButton>
      </section>

      {/* ── EDIT PROFILE MODAL ── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 backdrop-blur-sm"
          onClick={() => setEditing(false)}
        >
          <div
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200/60 bg-[var(--card)] p-4 shadow-2xl animate-fadeInScale dark:border-[var(--border)]/50 dark:bg-[var(--surface)] sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Edit Profile
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface-elevated)] px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Exam Track
              </label>
              <div className="flex gap-2">
                {["JEE", "NEET"].map((trackOption) => (
                  <button
                    key={trackOption}
                    type="button"
                    onClick={() => setEditExam(trackOption)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
                      editExam === trackOption
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-500 dark:text-white dark:border-white"
                        : "border-slate-200 dark:border-[var(--border)] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {trackOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Target Year
              </label>
              <select
                value={editYear}
                onChange={(e) => setEditYear(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface-elevated)] px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-brand text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVED TOAST ── */}
      {saved && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 animate-slideInRight sm:bottom-6 sm:left-auto sm:right-6">
          <span className="inline-flex items-center justify-center gap-2">
            <CircleCheck className="h-4 w-4" />
            Saved
          </span>
        </div>
      )}
    </PageWrapper>
  );
}
