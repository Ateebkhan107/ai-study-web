"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { getUserXP, getUserRank } from "@/lib/profile";

function getLevelProgress(xp){


if(xp >= 10000){

return {
current:xp,
next:20000
};

}



if(xp >= 5000){

return {
current:xp,
next:10000
};

}



if(xp >= 2000){

return {
current:xp,
next:5000
};

}



if(xp >= 500){

return {
current:xp,
next:2000
};

}



return {

current:xp,

next:500

};


}

export default function ProfilePage() {
  const { user: clerkUser } = useUser();

  const [user, setUser] = useState(null);
  const [xpData,setXpData]=useState(null);
const [rank,setRank]=useState(null);
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

  // ==============================
// LOAD XP PROFILE
// ==============================

useEffect(()=>{


if(!clerkUser) return;


async function loadXP(){


const xp =
await getUserXP(
clerkUser.id
);


const userRank =
await getUserRank(
clerkUser.id
);



setXpData(xp);

setRank(userRank);


}



loadXP();



},[clerkUser]);

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
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-32" />
        <div className="h-44 bg-gray-100 dark:bg-gray-900 rounded-3xl" />
      </div>
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

    // live stats coming from the profile API — each has a sane fallback
    streak: user?.streak_days ?? 0,
    avgSolveSeconds: user?.avg_solve_seconds ?? null,
    accuracy: user?.accuracy_percent ?? 0,
    testsCompleted: user?.tests_completed ?? 0,
   rank: rank,
    bestMockScore: user?.best_mock_score_percent ?? 0,
  };

  // BADGE DEFINITIONS — computed live from activeUser stats, not hardcoded
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

  const levelProgress =
getLevelProgress(
activeUser.xp
);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* TITLE */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">ACCOUNT</p>
        <h1 className="text-4xl font-black">Profile</h1>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white dark:bg-[#0b1020] rounded-3xl border border-gray-100 dark:border-gray-800/60 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            {/* AVATAR */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-3xl font-black shrink-0">
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
              <h2 className="text-2xl font-black">{activeUser.name}</h2>
              <p className="text-sm text-gray-400">{activeUser.email}</p>

              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 font-bold">
                  {activeUser.exam} Focus
                </span>
                <span className="text-gray-400">Target {activeUser.targetYear}</span>
              </div>

              {/* JEE / NEET TOGGLE */}
              <div className="mt-3 inline-flex rounded-xl bg-gray-100 dark:bg-gray-900 p-1">
                {["JEE", "NEET"].map((track) => {
                  const isActive = activeUser.exam === track;
                  return (
                    <button
                      key={track}
                      onClick={() => handleTrackToggle(track)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      {track}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
          >
            ✎ Edit Profile
          </button>
        </div>
      </div>

{/* XP CARD */}
<div className="bg-white dark:bg-[#0b1020] rounded-3xl border border-gray-100 dark:border-gray-800/60 p-6 shadow-sm">

  <div className="flex justify-between items-center">

    <div className="flex items-center gap-4">


      {/* BADGE */}
      <div
        className="
        min-w-[120px]
        h-14
        px-4
        rounded-xl
        bg-black
        text-white
        flex
        items-center
        justify-center
        font-bold
        text-sm
        shrink-0
        "
      >

        {activeUser.badge}

      </div>



      <div>

        <h3 className="font-bold">

          Level {activeUser.level}

        </h3>


        <p className="text-sm text-gray-400">

          {activeUser.xp} / {levelProgress.next} XP

        </p>


        {
          activeUser.rank &&
          (
            <p className="text-xs text-gray-400 mt-1">

              Global Rank #{activeUser.rank}

            </p>
          )
        }


      </div>


    </div>





    <div className="text-right">

      <p className="text-xs text-gray-400">

        Next level

      </p>


      <p className="font-bold">

        {
          Math.max(
            levelProgress.next - activeUser.xp,
            0
          )
        } XP away

      </p>


    </div>


  </div>





  <div className="mt-5 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">


    <div

      className="h-full bg-black dark:bg-white rounded-full transition-all"

      style={{

        width:`${Math.min(
          (activeUser.xp / levelProgress.next) * 100,
          100
        )}%`

      }}

    />


  </div>


</div>
      {/* BADGES */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black tracking-widest text-xs">BADGES</h3>
          <span className="text-xs font-semibold text-gray-400">
            {earnedCount}/{badgeDefs.length} earned
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-white dark:bg-[#0b1020] rounded-3xl border border-gray-100 dark:border-gray-800/60 p-5 shadow-sm">
          {badgeDefs.map((badge, index) => (
            <div
              key={index}
              className={`relative p-5 rounded-xl border text-center transition-opacity ${
                badge.earned
                  ? "border-gray-100 dark:border-gray-800/60 opacity-100"
                  : "border-gray-100 dark:border-gray-800/60 opacity-40"
              }`}
            >
              {badge.earned && (
                <span className="absolute top-2 right-2 text-[10px]">✅</span>
              )}
              <div className="text-2xl">{badge.icon}</div>
              <p className="text-xs font-bold mt-2">{badge.title}</p>
              <p className="text-[11px] text-gray-400 mt-1">{badge.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SIGN OUT */}
      <div className="pt-5">
        <SignOutButton>
          <button className="px-5 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors">
            Sign Out
          </button>
        </SignOutButton>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setEditing(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#0b1020] rounded-3xl shadow-xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black">Edit Profile</h3>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Exam Track
              </label>
              <div className="flex gap-2">
                {["JEE", "NEET"].map((track) => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => setEditExam(track)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      editExam === track
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-500"
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Target Year
              </label>
              <select
                value={editYear}
                onChange={(e) => setEditYear(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
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
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVED TOAST */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">
          Saved ✓
        </div>
      )}
    </div>
  );
}