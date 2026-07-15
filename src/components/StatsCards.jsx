"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

export default function StatsCards() {
  const { user, isLoaded } = useUser();

  const [stats, setStats] = useState([
    {
      label: "Tests Attempted",
      value: "0",
      sub: "Keep practicing",
      icon: "◈",
    },
    {
      label: "Accuracy",
      value: "0%",
      sub: "Based on answers",
      icon: "◎",
    },
    {
      label: "Rank",
      value: "#--",
      sub: "Keep climbing",
      icon: "◇",
    },
    {
      label: "Study Time",
      value: "0h",
      sub: "This month",
      icon: "◷",
    },
  ]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadStats() {
      try {
        // ==========================
        // TEST ATTEMPTS
        // ==========================

        const { count: testCount } = await supabase
          .from("test_attempts")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id);

        // ==========================
        // USER XP
        // ==========================

        const { data: xpData } = await supabase
          .from("user_xp")
          .select("xp, pyq_solved, correct_answers")
          .eq("user_id", user.id)
          .single();

        let accuracy = 0;

        if (xpData?.pyq_solved) {
          accuracy = Math.round(
            (xpData.correct_answers / xpData.pyq_solved) * 100
          );
        }

        // ==========================
        // RANK
        // ==========================

        let rank = "--";

        if (xpData) {
          const { count } = await supabase
            .from("user_xp")
            .select("*", {
              count: "exact",
              head: true,
            })
            .gt("xp", xpData.xp);

          rank = (count || 0) + 1;
        }

        // ==========================
        // STUDY TIME
        // ==========================

        let hours = 0;

        try {
          const { data: sessions } = await supabase
            .from("study_sessions")
            .select("duration_minutes")
            .eq("user_id", user.id);

          if (sessions?.length) {
            const total = sessions.reduce(
              (sum, item) => sum + (item.duration_minutes || 0),
              0
            );

            hours = Math.floor(total / 60);
          }
        } catch {
          hours = 0;
        }

        setStats([
          {
            label: "Tests Attempted",
            value: String(testCount || 0),
            sub: "Total tests given",
            icon: "◈",
          },
          {
            label: "Accuracy",
            value: `${accuracy}%`,
            sub: "Your performance",
            icon: "◎",
          },
          {
            label: "Rank",
            value: `#${rank}`,
            sub: "Based on XP",
            icon: "◇",
          },
          {
            label: "Study Time",
            value: `${hours}h`,
            sub: "This month",
            icon: "◷",
          },
        ]);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    }

    loadStats();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-4 flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
              {stat.label}
            </p>

            <span className="text-lg text-gray-300 transition-colors group-hover:text-gray-500 dark:text-gray-600">
              {stat.icon}
            </span>
          </div>

          <p className="mb-1 text-3xl font-black tracking-tight text-black dark:text-white">
            {stat.value}
          </p>

          <p className="text-xs text-gray-400">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}