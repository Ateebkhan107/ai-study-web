"use client";

import { SignOutButton, useClerk, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  CircleCheck,
  Compass,
  Flame,
  GraduationCap,
  Medal,
  Pencil,
  Settings,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { getLevelFromXP } from "@/utils/levelEngine";
import PageWrapper from "@/components/PageWrapper";
import { startProductTour } from "@/components/tour/ProductTourManager";

const BADGE_ICONS = {
  Award,
  BookOpen,
  CircleCheck,
  Flame,
  GraduationCap,
  Medal,
  Target,
  Trophy,
  Zap,
};

function getTierColor(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("leader") || t.includes("master")) {
    return {
      border: "border-amber-400 dark:border-brand shadow-[0_0_20px_rgba(234,179,8,0.3)]",
      ring: "ring-amber-200 dark:ring-amber-500/30",
      bg: "bg-gradient-to-br from-amber-400 to-amber-600 dark:from-brand dark:to-amber-600",
      text: "text-amber-700 dark:text-brand"
    };
  }
  if (t.includes("expert") || t.includes("pro")) {
    return {
      border: "border-slate-300 dark:border-slate-500 shadow-[0_0_15px_rgba(148,163,184,0.3)]",
      ring: "ring-slate-100 dark:ring-slate-700/50",
      bg: "bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600",
      text: "text-slate-700 dark:text-slate-300"
    };
  }
  // Default / Challenger / Explorer
  return {
    border: "border-orange-400/80 dark:border-orange-700/80 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
    ring: "ring-orange-100 dark:ring-orange-900/30",
    bg: "bg-gradient-to-br from-orange-300 to-orange-500 dark:from-orange-700 dark:to-orange-900",
    text: "text-orange-800 dark:text-orange-500"
  };
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { openUserProfile } = useClerk();

  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [rank, setRank] = useState(null);

  const [dynamicBadges, setDynamicBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    valid: false,
    available: false,
    message: "",
  });
  const [profileError, setProfileError] = useState("");
  const [editExam, setEditExam] = useState("JEE");
  const [editYear, setEditYear] = useState(2026);
  const [saved, setSaved] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear + i);

  // LOAD PROFILE
  useEffect(() => {
    async function fetchLiveProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
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
          setEditUsername(data.username || "");
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
  }, [clerkUser?.fullName, clerkUser?.id]);

  useEffect(() => {
    const username = editUsername.trim().toLowerCase();
    const currentUsername = String(user?.username || "").toLowerCase();
    const controller = new AbortController();

    async function checkUsername() {
      if (!username) {
        setUsernameStatus({
          checking: false,
          valid: false,
          available: false,
          message: "Choose a username.",
        });
        return;
      }

      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        setUsernameStatus({
          checking: false,
          valid: false,
          available: false,
          message: "Use 3-20 lowercase letters, numbers, or underscores.",
        });
        return;
      }

      if (username === currentUsername) {
        setUsernameStatus({
          checking: false,
          valid: true,
          available: true,
          message: "Current username",
        });
        return;
      }

      setUsernameStatus({
        checking: true,
        valid: true,
        available: false,
        message: "Checking availability...",
      });

      try {
        const response = await fetch(`/api/username/availability?username=${encodeURIComponent(username)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to check username.");
        setUsernameStatus({
          checking: false,
          valid: Boolean(data.valid),
          available: Boolean(data.available),
          message: data.available ? "Available" : data.error || "Already taken.",
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setUsernameStatus({
          checking: false,
          valid: false,
          available: false,
          message: error.message || "Unable to check username right now.",
        });
      }
    }

    const timeout = setTimeout(checkUsername, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [editUsername, user?.username]);

  // LOAD XP PROFILE & ANALYTICS
  useEffect(() => {
    if (!clerkUser || loading) return undefined;
    const controller = new AbortController();
    const schedule = typeof window !== "undefined" && "requestIdleCallback" in window
      ? window.requestIdleCallback
      : (callback) => window.setTimeout(callback, 120);
    const cancel = typeof window !== "undefined" && "cancelIdleCallback" in window
      ? window.cancelIdleCallback
      : window.clearTimeout;

    async function loadStats() {
      try {
        setBadgesLoading(true);
        const badgeRes = await fetch("/api/profile/badges", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (badgeRes.ok) {
          const dbBadges = await badgeRes.json();
          if (Array.isArray(dbBadges)) {
            setDynamicBadges(dbBadges);
          }
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.warn("Failed to fetch badges", err);
      } finally {
        setBadgesLoading(false);
      }
    }

    const taskId = schedule(loadStats);
    return () => {
      cancel(taskId);
      controller.abort();
    };
  }, [clerkUser, loading]);

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
    const normalizedUsername = editUsername.trim().toLowerCase();
    setProfileError("");

    if (!usernameStatus.available) {
      setProfileError("Choose an available username before saving.");
      return;
    }

    document.cookie = `prepzii_track=${editExam.toLowerCase()}; path=/; max-age=31536000; SameSite=Lax;`;

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editName,
          username: normalizedUsername,
          current_track: editExam.toLowerCase(),
          target_year: editYear,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setProfileError(data.error || "Unable to save profile.");
        return;
      }

      const data = await response.json();
      setUser((prev) => ({
        ...prev,
        ...data,
        full_name: editName,
        username: normalizedUsername,
        current_track: editExam.toLowerCase(),
        target_year: editYear,
      }));
      setEditing(false);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setProfileError("Unable to save profile.");
    }

    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    const fallbackName = clerkUser?.fullName || "Student Profile";
    const fallbackInitial = fallbackName.charAt(0)?.toUpperCase() || "S";

    return (
      <PageWrapper title="Profile" badge="ACCOUNT">
        <div className="space-y-6">
          <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 sm:p-8 shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface)]">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-950 text-2xl font-black text-white dark:border-[var(--border-subtle)] sm:h-24 sm:w-24">
                {clerkUser?.hasImage ? (
                  <img
                    src={clerkUser.imageUrl}
                    alt="profile"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  fallbackInitial
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Loading profile...
                </p>
                <h2 className="mt-1.5 truncate text-2xl font-black font-display text-slate-950 dark:text-white sm:text-3xl">
                  {fallbackName}
                </h2>
                <div className="mt-3 h-3 w-36 rounded-full skeleton-shimmer" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="space-y-5">
              <div className="h-36 rounded-2xl skeleton-shimmer" />
              <div className="h-48 rounded-2xl skeleton-shimmer" />
            </div>
            <div className="h-64 rounded-2xl skeleton-shimmer" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  const activeUser = {
    name: user?.full_name || clerkUser?.fullName || "Student",
    username: user?.username || "",
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
    pyqSolved: user?.pyq_solved || 0,
    accuracy: user?.accuracy || 0,
    testsCompleted: user?.tests_completed ?? null,
  };

  const badgeDefs = dynamicBadges;
  const earnedCount = badgeDefs.filter((b) => b.earned).length;
  const levelStats = getLevelFromXP(activeUser.xp);
  const progressPercentage = Number(levelStats.progressPercentage || 0);
  const profileInitial = activeUser.name?.charAt(0)?.toUpperCase() || "S";
  const tierColor = getTierColor(levelStats.title);

  return (
    <PageWrapper
      title="Student Profile"
      subtitle="Your PrepZii identity, exam goal, and progress record"
      badge="PROFILE"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-5">
          {/* ── PROFILE HERO ── */}
          <section className="animate-slideUp" style={{ animationDelay: "75ms" }}>
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 sm:p-8 shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface)] relative overflow-hidden">
              {/* Subtle background glow based on tier */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${tierColor.bg} opacity-[0.03] dark:opacity-[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none`} />

              <div className="flex flex-row items-start sm:items-center justify-between relative z-10">
                <div className="flex flex-row min-w-0 gap-3 sm:gap-6 sm:items-center">
                  
                  {/* TIERED AVATAR RING */}
                  <div className={`relative flex h-16 w-16 sm:h-28 sm:w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-[2px] sm:border-[4px] ${tierColor.border} bg-slate-950 text-2xl sm:text-3xl font-black font-display text-white dark:bg-[var(--surface-elevated)] ring-2 sm:ring-8 ${tierColor.ring} z-10`}>
                    {activeUser.avatar ? (
                      <img
                        src={activeUser.avatar}
                        alt="profile"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profileInitial
                    )}
                  </div>

                  <div className="min-w-0 pt-0.5 sm:pt-0">
                    <p className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Student Profile
                    </p>
                    <h2 className="break-words text-xl sm:text-4xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:mt-1.5">
                      {activeUser.name}
                    </h2>
                    <p className={`mt-0.5 sm:mt-1.5 truncate text-xs sm:text-sm font-bold ${tierColor.text}`}>
                      {activeUser.username ? `@${activeUser.username}` : "Username not set"}
                    </p>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium leading-tight sm:leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                      {activeUser.exam} aspirant for {activeUser.targetYear} · Level {levelStats.currentLevel} · {levelStats.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileError("");
                    setEditing(true);
                  }}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 sm:px-5 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-700 transition-colors hover:border-brand/50 hover:text-slate-950 hover:shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface-elevated)] dark:text-slate-200 dark:hover:text-white"
                >
                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} /> <span className="hidden sm:inline">Edit</span>
                </button>
              </div>

              <div className="mt-4 sm:mt-8 flex items-center justify-between border-t border-slate-200/80 pt-4 sm:pt-6 dark:border-[var(--border)]/70 relative z-10">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">
                    Exam Focus
                  </p>
                  <p className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Switch your active preparation track.
                  </p>
                </div>
                <div className="inline-flex rounded-lg sm:rounded-xl bg-slate-100/80 p-1 dark:bg-[var(--surface-elevated)]">
                  {["JEE", "NEET"].map((trackOption) => {
                    const isActive = activeUser.exam === trackOption;
                    return (
                      <button
                        key={trackOption}
                        onClick={() => handleTrackToggle(trackOption)}
                        className={`rounded-md sm:rounded-lg px-3 py-1.5 sm:px-6 sm:py-2.5 text-[10px] sm:text-xs font-black tracking-wide uppercase transition-all duration-300 ${
                          isActive
                            ? "bg-brand text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.3)] border border-brand sm:scale-105"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white border border-transparent"
                        }`}
                      >
                        {trackOption}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── USERNAME PROMPT ── */}
          {!activeUser.username && (
            <section className="animate-slideUp" style={{ animationDelay: "125ms" }}>
              <div className="rounded-2xl border border-brand/30 bg-brand/10 p-5 shadow-sm sm:p-6">
                <p className="text-base font-bold text-slate-950 dark:text-white">
                  Choose your PrepZii username
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  You&apos;ll need a unique @username for Battle Arena and student search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProfileError("");
                    setEditing(true);
                  }}
                  className="mt-4 rounded-xl bg-brand px-6 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-brand-hover shadow-sm"
                >
                  Choose Username
                </button>
              </div>
            </section>
          )}

          {/* ── PROGRESS ── */}
          <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 sm:p-8 shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between sm:block">
                    <div>
                      <p className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Progression
                      </p>
                      <h3 className="text-lg sm:mt-1.5 sm:text-2xl font-black font-display text-slate-950 dark:text-white">
                        Lvl {levelStats.currentLevel}: <span className={tierColor.text}>{levelStats.title}</span>
                      </h3>
                    </div>
                    <div className="sm:hidden text-right">
                      <p className={`text-lg font-black font-display tabular-nums tracking-tighter ${tierColor.text}`}>
                        {activeUser.rank ? `#${activeUser.rank}` : "—"}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Rank</p>
                    </div>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <span className="text-slate-700 dark:text-slate-300">{levelStats.totalXP.toLocaleString()} XP</span> · {levelStats.xpRemaining.toLocaleString()} to next
                  </p>

                  {/* SEGMENTED PROGRESS BAR */}
                  <div className="mt-3 sm:mt-6 flex gap-1 h-2 sm:h-3 items-center">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const threshold = i * 10;
                      const isFilled = progressPercentage > threshold;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm transition-colors duration-500 h-full ${
                            isFilled 
                              ? tierColor.bg 
                              : "bg-slate-100 dark:bg-[var(--surface-elevated)]"
                          }`}
                        />
                      );
                    })}
                    <span className="sm:hidden ml-2 text-[10px] font-black text-slate-900 dark:text-white shrink-0">{progressPercentage.toFixed(0)}%</span>
                  </div>
                </div>

                {/* ELEVATED STAT CHIPS */}
                <div className="hidden sm:flex flex-row gap-2 sm:gap-4 shrink-0">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-3 sm:px-5 sm:py-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 min-w-[80px] sm:min-w-[100px] shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-center">Global Rank</p>
                    <p className={`mt-1.5 text-xl sm:text-3xl font-black font-display tabular-nums tracking-tighter ${tierColor.text}`}>
                      {activeUser.rank ? `#${activeUser.rank}` : "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-3 sm:px-5 sm:py-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30 min-w-[80px] sm:min-w-[100px] shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-center">Progress</p>
                    <p className={`mt-1.5 text-xl sm:text-3xl font-black font-display tabular-nums tracking-tighter text-slate-900 dark:text-white`}>
                      {progressPercentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── BADGES ── */}
          <section className="animate-slideUp" style={{ animationDelay: "300ms" }}>
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <h3 className="text-lg font-black font-display text-slate-950 dark:text-white tracking-tight">
                  Achievements
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Badges unlocked through practice, tests, and streaks.
                </p>
              </div>
              <div className="shrink-0 rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)] px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[var(--border-subtle)]">
                {earnedCount}/{badgeDefs.length} earned
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface)] sm:p-6">
              {badgesLoading ? (
                <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30">
                      <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-28 rounded-full skeleton-shimmer" />
                        <div className="h-3 w-20 rounded-full skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : badgeDefs.length === 0 || earnedCount === 0 ? (
                // TROPHY CABINET EMPTY STATE
                <div className="flex flex-row sm:flex-col items-center sm:justify-center rounded-xl sm:rounded-2xl border border-dashed border-amber-200/60 bg-amber-50/50 p-4 sm:p-10 text-left sm:text-center dark:border-brand/30 dark:bg-brand/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-100/30 dark:to-brand/10 pointer-events-none hidden sm:block" />
                  
                  <div className="flex h-10 w-10 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-sm dark:from-brand/20 dark:to-brand/10 sm:mb-4 mr-3 sm:mr-0 z-10 border border-amber-200/50 dark:border-brand/30 ring-2 sm:ring-4 ring-amber-50 dark:ring-brand/5">
                    <Trophy className="h-5 w-5 sm:h-8 sm:w-8 text-amber-600 dark:text-brand" strokeWidth={2} />
                  </div>
                  
                  <div className="z-10">
                    <h4 className="text-sm sm:text-lg font-black font-display text-amber-950 dark:text-white tracking-tight">
                      Your Trophy Cabinet Awaits
                    </h4>
                    <p className="mt-0.5 sm:mt-2 text-[11px] sm:text-sm font-medium leading-relaxed text-amber-800/80 dark:text-amber-200/60 max-w-sm">
                      Complete mock tests, streaks, and conquer the Arena to unlock achievements.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:gap-4">
                  {badgeDefs.map((badge, index) => {
                    const IconComponent = BADGE_ICONS[badge.iconName] || Award;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 sm:gap-4 rounded-xl border p-3 sm:p-4 transition-colors ${
                          badge.earned
                            ? "border-brand/40 bg-brand/5 shadow-sm"
                            : "border-slate-200 bg-slate-50 opacity-60 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30"
                        }`}
                      >
                        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border ${
                          badge.earned
                            ? "border-brand/40 bg-brand/10 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                            : "border-slate-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]"
                        }`}>
                          <IconComponent className={`h-6 w-6 ${badge.earned ? "text-brand" : "text-slate-400"}`} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                            {badge.title}
                          </h4>
                          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            {badge.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── ACTIONS SIDEBAR ── */}
        <aside className="space-y-4 sm:space-y-5 animate-slideUp" style={{ animationDelay: "200ms" }}>
          <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface)]">
            <h3 className="text-sm sm:text-lg font-black font-display text-slate-950 dark:text-white tracking-tight">Profile Actions</h3>
            <p className="hidden sm:block mt-1.5 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
              Manage your account identity and keep your exam goals aligned.
            </p>

            <div className="mt-3 sm:mt-6 flex flex-col gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  setProfileError("");
                  setEditing(true);
                }}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-transparent p-2 sm:p-3 text-left transition-all hover:bg-slate-50 hover:border-slate-200 dark:hover:bg-[var(--surface-elevated)]/50 dark:hover:border-[var(--border-subtle)]"
              >
                <span className="inline-flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-500/20">
                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} />
                  </div>
                  Edit Profile
                </span>
                <span className="text-slate-400 transition-transform group-hover:translate-x-1">›</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setProfileError("");
                  setEditing(true);
                }}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-transparent p-2 sm:p-3 text-left transition-all hover:bg-slate-50 hover:border-slate-200 dark:hover:bg-[var(--surface-elevated)]/50 dark:hover:border-[var(--border-subtle)]"
              >
                <span className="inline-flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} />
                  </div>
                  Change Exam Goal
                </span>
                <span className="text-slate-400 transition-transform group-hover:translate-x-1">›</span>
              </button>

              <button
                type="button"
                onClick={() => openUserProfile?.()}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-transparent p-2 sm:p-3 text-left transition-all hover:bg-slate-50 hover:border-slate-200 dark:hover:bg-[var(--surface-elevated)]/50 dark:hover:border-[var(--border-subtle)]"
              >
                <span className="inline-flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-[var(--surface-elevated)] dark:text-slate-300 shadow-sm border border-slate-200 dark:border-[var(--border-subtle)]">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} />
                  </div>
                  Manage Account
                </span>
                <span className="text-slate-400 transition-transform group-hover:translate-x-1">›</span>
              </button>

              <button
                type="button"
                onClick={() => startProductTour()}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-transparent p-2 sm:p-3 text-left transition-all hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-500/10 dark:hover:border-amber-500/20"
              >
                <span className="inline-flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-500/30">
                    <Compass className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-brand" strokeWidth={2.5} />
                  </div>
                  Take Product Tour Again
                </span>
                <span className="text-amber-400 transition-transform group-hover:translate-x-1">›</span>
              </button>

              <div className="my-1 sm:my-2 border-t border-slate-200 dark:border-[var(--border-subtle)]" />

              <SignOutButton>
                <button className="group flex w-full items-center justify-between gap-3 rounded-xl border border-transparent p-2 sm:p-3 text-left transition-all hover:bg-rose-50 hover:border-rose-100 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/20">
                  <span className="inline-flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                    <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} />
                    </div>
                    Sign Out
                  </span>
                  <span className="text-rose-300 transition-transform group-hover:translate-x-1">›</span>
                </button>
              </SignOutButton>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-[var(--card)] p-4 sm:p-6 shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-brand" />
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Student Summary
            </p>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
              {activeUser.exam} focus for {activeUser.targetYear}. <span className="text-slate-950 dark:text-white font-black">{activeUser.pyqSolved || 0} PYQs</span> solved with <span className="text-emerald-600 dark:text-emerald-400 font-black">{activeUser.accuracy || 0}% accuracy</span>.
            </p>
          </div>
        </aside>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 backdrop-blur-sm"
          onClick={() => setEditing(false)}
        >
          <div
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl animate-fadeInScale dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
              Edit Profile
            </h3>
            <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update your visible name, username, active exam track, and target year.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-white"
              />
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  @
                </span>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9_]{3,20}"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-8 text-sm text-slate-900 focus:border-brand focus:outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-white"
                />
              </div>
              <p
                className={`text-xs font-semibold ${
                  usernameStatus.available
                    ? "text-emerald-600 dark:text-emerald-400"
                    : usernameStatus.checking
                      ? "text-slate-400"
                      : "text-amber-600 dark:text-amber-300"
                }`}
              >
                {usernameStatus.message}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                Exam Track
              </label>
              <div className="flex gap-2">
                {["JEE", "NEET"].map((trackOption) => (
                  <button
                    key={trackOption}
                    type="button"
                    onClick={() => setEditExam(trackOption)}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-colors duration-150 ${
                      editExam === trackOption
                        ? "border-brand bg-brand text-slate-950"
                        : "border-slate-200 text-slate-500 hover:text-slate-900 dark:border-[var(--border-subtle)] dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {trackOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                Target Year
              </label>
              <select
                value={editYear}
                onChange={(e) => setEditYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-white"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {profileError && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {profileError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-[var(--surface-elevated)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!usernameStatus.available}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVED TOAST ── */}
      {saved && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border border-brand/30 bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg animate-slideInRight dark:bg-[var(--surface)] sm:bottom-6 sm:left-auto sm:right-6">
          <span className="inline-flex items-center justify-center gap-2">
            <CircleCheck className="h-4 w-4" />
            Saved
          </span>
        </div>
      )}
    </PageWrapper>
  );
}
