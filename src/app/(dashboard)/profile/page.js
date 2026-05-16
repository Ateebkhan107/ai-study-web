"use client";

import { useState } from "react";

// ── Mock data — replace with Supabase fetch later ─────────────────
const MOCK_USER = {
  name: "Aryan Mehta",
  phone: "+91 98765 43210",
  avatar: "A",
  exam: "JEE",
  targetYear: 2026,
  joinedDate: "January 2025",
  streak: 7,
  xp: 2340,
  level: 12,
  badges: [
    { icon: "🔥", label: "7-Day Streak", earned: true },
    { icon: "⚡", label: "Speed Solver", earned: true },
    { icon: "🎯", label: "Sharpshooter", earned: true },
    { icon: "💎", label: "50 Tests", earned: false },
    { icon: "🏆", label: "Top 100", earned: false },
    { icon: "🧠", label: "All Subjects", earned: false },
  ],
};

const XP_FOR_NEXT_LEVEL = 3000;

export default function ProfilePage() {
  const [user, setUser] = useState(MOCK_USER);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editExam, setEditExam] = useState(user.exam);
  const [editYear, setEditYear] = useState(user.targetYear);
  const [saved, setSaved] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear + i);

  const handleSave = () => {
    setUser((prev) => ({ ...prev, name: editName, exam: editExam, targetYear: editYear }));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    // TODO: await supabase.from("profiles").update({ full_name: editName, exam_target: editExam, target_year: editYear })
  };

  const xpProgress = Math.round((user.xp / XP_FOR_NEXT_LEVEL) * 100);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">Profile</h1>
      </div>

      {/* ── Top section — Avatar + Info + Edit ─────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-3xl font-black">
              {user.name[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white dark:border-gray-900" />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-black text-black dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1 w-full max-w-xs focus:outline-none focus:border-gray-400 mb-1"
              />
            ) : (
              <h2 className="text-2xl font-black text-black dark:text-white">{user.name}</h2>
            )}
            <p className="text-sm text-gray-400 mt-0.5">{user.phone}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#1e3a5f] text-white">
                {user.exam}
              </span>
              <span className="text-xs text-gray-400">Target {user.targetYear}</span>
              <span className="text-xs text-gray-400">Joined {user.joinedDate}</span>
            </div>
          </div>

          {/* Edit / Save buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {saved && (
              <span className="text-xs text-green-500 font-semibold">✓ Saved</span>
            )}
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                ✎ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Edit fields */}
        {editing && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Target Exam
              </label>
              <div className="flex gap-2">
                {["JEE", "NEET"].map((e) => (
                  <button
                    key={e}
                    onClick={() => setEditExam(e)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all
                      ${editExam === e
                        ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 bg-gray-50 dark:bg-gray-800"
                      }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Target Year
              </label>
              <div className="flex gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setEditYear(y)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all
                      ${editYear === y
                        ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 bg-gray-50 dark:bg-gray-800"
                      }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── XP + Level bar ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-sm font-black">
              {user.level}
            </div>
            <div>
              <p className="text-sm font-black text-black dark:text-white">Level {user.level}</p>
              <p className="text-xs text-gray-400">{user.xp} / {XP_FOR_NEXT_LEVEL} XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Next level</p>
            <p className="text-sm font-bold text-black dark:text-white">{XP_FOR_NEXT_LEVEL - user.xp} XP away</p>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white rounded-full transition-all duration-700"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* ── Bottom — Badges only ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">Badges</h3>
          <span className="text-xs text-gray-400">{user.badges.filter(b => b.earned).length}/{user.badges.length} earned</span>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {user.badges.map((badge) => (
            <div
              key={badge.label}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
                ${badge.earned
                  ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  : "bg-gray-50/40 dark:bg-gray-800/30 border-dashed border-gray-200 dark:border-gray-700 opacity-40"
                }`}
            >
              <span className={`text-2xl ${!badge.earned ? "grayscale" : ""}`}>{badge.icon}</span>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">
                {badge.label}
              </span>
              {badge.earned && (
                <span className="text-[9px] font-bold text-green-500">Earned</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Danger zone ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              // TODO: supabase.auth.signOut() then router.push("/login")
              alert("Sign out → redirect to /login");
            }}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Sign Out
          </button>
          <button
            onClick={() => alert("Delete account — confirm dialog here")}
            className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

    </div>
  );
}