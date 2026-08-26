"use client";

import { SignOutButton, useClerk, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  CircleCheck,
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



export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { openUserProfile } = useClerk();

  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [rank, setRank] = useState(null);

  const [dynamicBadges, setDynamicBadges] = useState([]);
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
  }, [clerkUser]);

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
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand/30 bg-slate-950 text-2xl font-semibold text-white dark:bg-[var(--surface-elevated)] sm:h-24 sm:w-24 sm:text-3xl">
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

                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                      Student Profile
                    </p>
                    <h2 className="mt-1 break-words text-2xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
                      {activeUser.name}
                    </h2>
                    <p className="mt-1 truncate text-sm font-semibold text-amber-700 dark:text-brand">
                      {activeUser.username ? `@${activeUser.username}` : "Username not set"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {activeUser.exam} aspirant for {activeUser.targetYear} · Level {levelStats.currentLevel} · {levelStats.title}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-400 dark:text-slate-500">
                      {activeUser.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileError("");
                    setEditing(true);
                  }}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/50 hover:text-slate-950 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-200 dark:hover:text-white sm:w-auto"
                >
                  <Pencil className="h-4 w-4" /> Edit Profile
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-[var(--border-subtle)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    Exam focus
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Switch your active preparation track.
                  </p>
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]">
                  {["JEE", "NEET"].map((trackOption) => {
                    const isActive = activeUser.exam === trackOption;
                    return (
                      <button
                        key={trackOption}
                        onClick={() => handleTrackToggle(trackOption)}
                        className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-brand text-slate-950"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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

          {/* ── PROGRESS ── */}
          {!activeUser.username && (
            <section className="animate-slideUp" style={{ animationDelay: "125ms" }}>
              <div className="rounded-xl border border-brand/30 bg-brand/10 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Choose your PrepZii username
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  You&apos;ll need a unique @username for Battle Arena and student search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProfileError("");
                    setEditing(true);
                  }}
                  className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-hover"
                >
                  Choose Username
                </button>
              </div>
            </section>
          )}

          {/* ── PROGRESS ── */}
          <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
                    Progress
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                    Level {levelStats.currentLevel}: {levelStats.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {levelStats.totalXP.toLocaleString()} XP earned · {levelStats.xpRemaining.toLocaleString()} XP to next level
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left sm:text-right">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Global rank</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950 dark:text-white">
                      {activeUser.rank ? `#${activeUser.rank}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Progress</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950 dark:text-white">
                      {progressPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-500">
                <span>{levelStats.totalXP.toLocaleString()} XP</span>
                <span>{levelStats.nextLevelXP.toLocaleString()} XP</span>
              </div>
            </div>
          </section>

          {/* ── BADGES ── */}
          <section className="animate-slideUp" style={{ animationDelay: "300ms" }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                  Achievements
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Badges unlocked through practice, tests, and streaks.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-500">
                {earnedCount}/{badgeDefs.length} earned
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
              {badgeDefs.length === 0 || earnedCount === 0 ? (
                <div className="flex items-start gap-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/35">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/30 bg-brand/10">
                    <Award className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">No badges yet</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Complete tests and streaks to unlock achievements.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {badgeDefs.map((badge, index) => {
                    const IconComponent = BADGE_ICONS[badge.iconName] || Award;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          badge.earned
                            ? "border-brand/30 bg-brand/5"
                            : "border-slate-200 bg-slate-50 opacity-65 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/35"
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                          badge.earned
                            ? "border-brand/30 bg-brand/10"
                            : "border-slate-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]"
                        }`}>
                          <IconComponent className={`h-5 w-5 ${badge.earned ? "text-brand" : "text-slate-400"}`} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                            {badge.title}
                          </h4>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-500">
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

        {/* ── ACTIONS ── */}
        <aside className="space-y-5 animate-slideUp" style={{ animationDelay: "200ms" }}>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">Profile Actions</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Keep your account and exam goal aligned with your preparation.
            </p>

            <div className="mt-5 divide-y divide-slate-200 dark:divide-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setProfileError("");
                  setEditing(true);
                }}
                className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                <span className="inline-flex items-center gap-3">
                  <Pencil className="h-4 w-4 text-slate-500" />
                  Edit Profile
                </span>
                <span className="text-slate-400">›</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileError("");
                  setEditing(true);
                }}
                className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                <span className="inline-flex items-center gap-3">
                  <Target className="h-4 w-4 text-slate-500" />
                  Change Exam Goal
                </span>
                <span className="text-slate-400">›</span>
              </button>
              <button
                type="button"
                onClick={() => openUserProfile?.()}
                className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                <span className="inline-flex items-center gap-3">
                  <Settings className="h-4 w-4 text-slate-500" />
                  Manage Account
                </span>
                <span className="text-slate-400">›</span>
              </button>
              <SignOutButton>
                <button className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300">
                  <span className="inline-flex items-center gap-3">
                    <Zap className="h-4 w-4" />
                    Sign Out
                  </span>
                  <span className="text-rose-300">›</span>
                </button>
              </SignOutButton>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
              Student Summary
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {activeUser.exam} focus for {activeUser.targetYear}. {activeUser.pyqSolved || 0} PYQs solved with {activeUser.accuracy || 0}% accuracy.
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
