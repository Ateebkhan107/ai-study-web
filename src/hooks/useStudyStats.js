"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function useStudyStats() {

  const { user } = useUser();

  const [loading, setLoading] = useState(true);

  const [todaySeconds, setTodaySeconds] = useState(0);

  const [yesterdaySeconds, setYesterdaySeconds] = useState(0);

  const [weekSeconds, setWeekSeconds] = useState(0);

  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {

    if (!user) return;

    loadStats();

  }, [user]);

  async function loadStats() {

    setLoading(true);

    const today = new Date();

    const startToday = new Date(today);

    startToday.setHours(0,0,0,0);

    const startYesterday = new Date(startToday);

    startYesterday.setDate(startYesterday.getDate()-1);

    const startWeek = new Date(startToday);

    startWeek.setDate(startWeek.getDate()-6);

    const { data } = await supabase

      .from("study_sessions")

      .select("duration_seconds,created_at")

      .eq("clerk_user_id", user.id);

    let todayTotal = 0;

    let yesterdayTotal = 0;

    let weekTotal = 0;

    let grandTotal = 0;

    (data || []).forEach(session => {

      const duration = session.duration_seconds || 0;

      const date = new Date(session.created_at);

      grandTotal += duration;

      if (date >= startWeek) {

        weekTotal += duration;

      }

      if (date >= startToday) {

        todayTotal += duration;

      }

      else if (date >= startYesterday && date < startToday) {

        yesterdayTotal += duration;

      }

    });

    setTodaySeconds(todayTotal);

    setYesterdaySeconds(yesterdayTotal);

    setWeekSeconds(weekTotal);

    setTotalSeconds(grandTotal);

    setLoading(false);

  }

  return {

    loading,

    todaySeconds,

    yesterdaySeconds,

    weekSeconds,

    totalSeconds,

    refreshStats: loadStats,

  };

}