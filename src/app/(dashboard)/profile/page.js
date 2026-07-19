"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { getUserXP, getUserRank } from "@/lib/profile";
import PageWrapper from "@/components/PageWrapper";

function getLevelProgress(xp) {
  if (xp >= 10000) return { current: xp, next: 20000 };
  if (xp >= 5000) return { current: xp, next: 10000 };
  if (xp >= 2000) return { current: xp, next: 5000 };
  if (xp >= 500) return { current: xp, next: 2000 };
  return { current: xp, next: 500 };
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser();

  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [rank, setRank] = useState(null);
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

  // LOAD XP PROFILE
  useEffect(() => {
    if (!clerkUser) return;
    async function loadXP() {
      const xp = await getUserXP(clerkUser.id);
      const userRank = await getUserRank(clerkUser.id);
      setXpData(xp);
      setRank(userRank);
    }
    loadXP();
  }, [clerkUser]);

  // CHANGE TRACK (JEE / NEET toggle)
  const handleTrackToggle = async (newExam) => {
    const currentActiveTrack = user?.current_track || "jee";
    if (newExam.toLowerCase() === currentActiveTrack.toLowerCase()) return;

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
      window.location.reload();
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
    badge: xpData?.badge || "🌱 Explorer",
    progress: xpData?.xp || 0,
    streak: user?.streak_days ?? 0,
    avgSolveSeconds: user?.avg_solve_seconds ?? null,
    accuracy: user?.accuracy_percent ?? 0,
    testsCompleted: user?.tests_completed ?? 0,
    rank: rank,
    bestMockScore: user?.best_mock_score_percent ?? 0,
  };

  // BADGE DEFINITIONS
  const badgeDefs = [
    {
      icon: "🔥",
      title: "7-Day Streak",
      earned: activeUser.streak >= 7,
      detail: `${Math.min(activeUser.streak, 7)}/7 days`,
    },
    {
      icon: "⚡",
      title: "Speed Solver",
      earned: activeUser.avgSolveSeconds != null && activeUser.avgSolveSeconds <= 60,
      detail:
        activeUser.avgSolveSeconds != null
          ? `${activeUser.avgSolveSeconds}s avg`
          : "No data yet",
    },
    {
      icon: "🎯",
      title: "Sharpshooter",
      earned: activeUser.accuracy >= 90,
      detail: `${activeUser.accuracy}% accuracy`,
    },
    {
      icon: "💎",
      title: "50 Tests",
      earned: activeUser.testsCompleted >= 50,
      detail: `${Math.min(activeUser.testsCompleted, 50)}/50 tests`,
    },
    {
      icon: "🏆",
      title: "Top 100",
      earned: activeUser.rank != null && activeUser.rank <= 100,
      detail: activeUser.rank != null ? `Rank #${activeUser.rank}` : "Unranked",
    },
    {
      icon: "🚀",
      title: "Mock Test Ace",
      earned: activeUser.bestMockScore >= 90,
      detail:
        activeUser.bestMockScore > 0
          ? `Best: ${activeUser.bestMockScore}%`
          : "No mocks yet",
    },
  ];

  const earnedCount = badgeDefs.filter((b) => b.earned).length;
  const levelProgress = getLevelProgress(activeUser.xp);

  return (
    <PageWrapper
      title="Profile"
      subtitle="Manage your account and track progress"
      badge="ACCOUNT"
    >
      {/* ── PROFILE CARD ── */}
      <section className="animate-slideUp" style={{ animationDelay: "75ms" }}>
        <div className="glass-card p-6 shadow-sm relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-violet-500/5 to-transparent dark:from-indigo-500/10 dark:via-violet-500/6 dark:to-transparent rounded-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5">
              {/* AVATAR */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-indigo-500/40 dark:ring-indigo-400/40 shadow-[0_0_25px_rgba(99,102,241,0.2)] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 text-3xl font-black shrink-0">
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

              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {activeUser.name}
                </h2>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {activeUser.email}
                </p>

                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold">
                    {activeUser.exam} Focus
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    Target {activeUser.targetYear}
                  </span>
                </div>

                {/* JEE / NEET TOGGLE */}
                <div className="mt-3 inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  {["JEE", "NEET"].map((trackOption) => {
                    const isActive = activeUser.exam === trackOption;
                    return (
                      <button
                        key={trackOption}
                        onClick={() => handleTrackToggle(trackOption)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                          isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
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
              className="border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2"
            >
              ✎ Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* ── XP CARD ── */}
      <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
        <div className="glass-card p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* BADGE */}
              <div className="min-w-[120px] h-14 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-indigo-500/20">
                {activeUser.badge}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Level {activeUser.level}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {activeUser.xp} / {levelProgress.next} XP
                </p>
                {activeUser.rank && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Global Rank #{activeUser.rank}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Next level
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {Math.max(levelProgress.next - activeUser.xp, 0)} XP away
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all relative overflow-hidden"
              style={{
                width: `${Math.min(
                  (activeUser.xp / levelProgress.next) * 100,
                  100
                )}%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK STATS ── */}
      <section className="animate-slideUp" style={{ animationDelay: "200ms" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tests Done", value: activeUser.testsCompleted, icon: "📝" },
            { label: "Accuracy", value: `${activeUser.accuracy}%`, icon: "🎯" },
            { label: "Streak", value: `${activeUser.streak}d`, icon: "🔥" },
            { label: "Global Rank", value: activeUser.rank ? `#${activeUser.rank}` : "—", icon: "🏆" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{stat.label}</p>
            </div>
          ))}
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

        <div className="glass-card p-5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badgeDefs.map((badge, index) => (
              <div
                key={index}
                className={`group relative p-5 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1 ${
                  badge.earned
                    ? "border-slate-200/60 dark:border-slate-700/50 opacity-100 hover:shadow-lg hover:shadow-indigo-500/10"
                    : "border-slate-200/60 dark:border-slate-700/50 opacity-40"
                }`}
              >
                {badge.earned && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                )}
                <div
                  className={`text-3xl ${
                    badge.earned
                      ? "group-hover:scale-110 transition-transform duration-300"
                      : ""
                  }`}
                >
                  {badge.icon}
                </div>
                <p className="text-xs font-bold mt-2 text-slate-800 dark:text-slate-100">
                  {badge.title}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {badge.detail}
                </p>
              </div>
            ))}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setEditing(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 space-y-5 animate-fadeInScale"
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
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
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
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
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
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
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
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVED TOAST ── */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 animate-slideInRight z-50">
          Saved ✓
        </div>
      )}
    </PageWrapper>
  );
}