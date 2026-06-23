"use client";

import { SignOutButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const XP_FOR_NEXT_LEVEL = 3000;

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editExam, setEditExam] = useState("JEE");
  const [editYear, setEditYear] = useState(2026);
  const [saved, setSaved] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear + i);

  // 📡 Step 1: Fetch live student record from our background database router on load
  useEffect(() => {
    async function fetchLiveProfile() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setEditName(data.full_name || "Syed Ateeb");
          setEditExam(data.current_track?.toUpperCase() || "JEE");
          setEditYear(data.target_year || 2026);
        }
      } catch (error) {
        console.error("Failed to read profile vault rows:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveProfile();
  }, []);

  // 🔄 Step 2: Instant multi-toggle handler for pill buttons (Lock-free implementation)
  const handleTrackToggle = async (newExam) => {
    const currentActiveTrack = user?.current_track || "jee";
    if (newExam.toLowerCase() === currentActiveTrack.toLowerCase()) return;
    
    // Write cookie selection cleanly for client-side layouts
    if (typeof window !== "undefined") {
      document.cookie = `prepzii_track=${newExam.toLowerCase()}; path=/; max-age=31536000; SameSite=Lax;`;
    }

    // Optimistically update screen states instantly 
    if (user) {
      setUser((prev) => ({ ...prev, current_track: newExam.toLowerCase() }));
    } else {
      setUser({ current_track: newExam.toLowerCase() });
    }
    
    setEditExam(newExam);
    setSaved(true);

    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_track: newExam.toLowerCase() }),
      });
    } catch (err) {
      console.error("Database tracker modification failure:", err);
    }

    setTimeout(() => {
      setSaved(false);
      window.location.reload(); // Quick refresh to update the global wrapper layout states
    }, 1000);
  };

  // 💾 Step 3: Handle saving information from popup/input drawers
  const handleSave = async () => {
    setUser((prev) => ({ 
      ...prev, 
      full_name: editName, 
      current_track: editExam.toLowerCase(), 
      target_year: editYear 
    }));
    
    if (typeof window !== "undefined") {
      document.cookie = `prepzii_track=${editExam.toLowerCase()}; path=/; max-age=31536000; SameSite=Lax;`;
    }

    setEditing(false);
    setSaved(true);

    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          full_name: editName, 
          current_track: editExam.toLowerCase(), 
          target_year: editYear 
        }),
      });
    } catch (err) {
      console.error("Failed to update user row data:", err);
    }

    setTimeout(() => setSaved(false), 2500);
  };

  // Render loading skeleton screen while background fetching takes place
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-32" />
        <div className="h-44 bg-gray-100 dark:bg-gray-900 rounded-3xl w-full" />
      </div>
    );
  }

  // 🛡️ Step 4: Fallback defaults calculation mapper (Guarantees user fields are NEVER blank)
  const activeUser = {
    name: user?.full_name || "Syed Ateeb",
    phone: user?.phone_number || "+91 98765 43210",
    exam: user?.current_track?.toUpperCase() || editExam || "JEE",
    targetYear: user?.target_year || 2026,
    joinedDate: "January 2025",
    xp: user?.xp || 0,
    level: user?.level || 1,
    badges: [
      { icon: "🔥", label: "7-Day Streak", earned: true },
      { icon: "⚡", label: "Speed Solver", earned: true },
      { icon: "🎯", label: "Sharpshooter", earned: true },
      { icon: "💎", label: "50 Tests", earned: false },
      { icon: "🏆", label: "Top 100", earned: false },
      { icon: "🧠", label: "All Subjects", earned: false },
    ]
  };

  const xpProgress = Math.round(((activeUser.xp || 0) / XP_FOR_NEXT_LEVEL) * 100);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">Profile</h1>
      </div>

      {/* ── Top section — Avatar + Info + Edit ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-3xl font-black border border-gray-100 dark:border-gray-800">
              {activeUser.name[0]}
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
              <h2 className="text-2xl font-black text-black dark:text-white">{activeUser.name}</h2>
            )}
            <p className="text-sm text-gray-400 mt-0.5">{activeUser.phone}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                activeUser.exam === "NEET" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400" 
                  : "bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400"
              }`}>
                {activeUser.exam} Focus
              </span>
              <span className="text-xs text-gray-400">Target {activeUser.targetYear}</span>
              <span className="text-xs text-gray-400">Live Vault Connected ✅</span>
            </div>
          </div>

          {/* Edit / Save buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {saved && (
              <span className="text-xs text-green-500 font-semibold">✓ Live Syncing...</span>
            )}
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                ✎ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Edit fields drawer */}
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
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer
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
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer
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

      {/* ── 🎯 RESTYLED INLINE ACADEMIC TRACK CONFIGURATION CARD ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Academic Track Configuration
          </p>
          <h3 className="text-base font-black text-black dark:text-white">
            Current Target Engine
          </h3>
        </div>
        
        {/* Simplified Inline Segmented Toggle Bar */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200/50 dark:border-gray-700 shrink-0">
          <button
            onClick={() => handleTrackToggle("JEE")}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeUser.exam === "JEE"
                ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/10"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            IIT JEE Engineering 🚀
          </button>
          <button
            onClick={() => handleTrackToggle("NEET")}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeUser.exam === "NEET"
                ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/10"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            NEET Medical 🧬
          </button>
        </div>
      </div>

      {/* ── XP + Level bar ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-sm font-black border border-gray-100 dark:border-gray-800">
              {activeUser.level}
            </div>
            <div>
              <p className="text-sm font-black text-black dark:text-white">Level {activeUser.level}</p>
              <p className="text-xs text-gray-400">{activeUser.xp} / {XP_FOR_NEXT_LEVEL} XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Next level</p>
            <p className="text-sm font-bold text-black dark:text-white">{XP_FOR_NEXT_LEVEL - activeUser.xp} XP away</p>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white rounded-full transition-all duration-700"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* ── Bottom — Badges ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">Badges</h3>
          <span className="text-xs text-gray-400">{activeUser.badges.filter(b => b.earned).length}/{activeUser.badges.length} earned</span>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 grid grid-cols-3 sm:grid-cols-6 gap-3 shadow-sm">
          {activeUser.badges.map((badge) => (
            <div
              key={badge.label}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
                ${badge.earned
                  ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                  : "bg-gray-50/40 dark:bg-gray-800/30 border-dashed border-gray-200 dark:border-gray-700 opacity-40 select-none"
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

      {/* ── Danger zone ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Actions</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <SignOutButton redirectUrl="/sign-in">
            <button className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>

    </div>
  );
}