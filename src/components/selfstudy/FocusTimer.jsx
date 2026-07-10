"use client";

import { useUser } from "@clerk/nextjs";
import {
  startStudySession,
  finishStudySession,
} from "@/lib/studySession";

import { useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Clock3,
} from "lucide-react";

import { useSelfStudy } from "@/context/SelfStudyContext";

export default function FocusTimer() {
  const { user } = useUser();

  const {
    exam,
    subject,
    mode,
    running,
    setRunning,
    paused,
    setPaused,
    seconds,
    setSeconds,
    timerType,
    setTimerType,
    pomodoroMinutes,
    setPomodoroMinutes,
    elapsedToday,
    setElapsedToday,
    sessionId,
    setSessionId,
  } = useSelfStudy();

  // ==========================
  // TIMER
  // ==========================

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running, setSeconds]);

  // ==========================
  // DISPLAY
  // ==========================

  const display = useMemo(() => {
    if (timerType === "stopwatch") {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }

    const total = pomodoroMinutes * 60;
    const remaining = Math.max(0, total - seconds);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, [seconds, timerType, pomodoroMinutes]);

  // ==========================
  // ACTIONS
  // ==========================

  async function startSession() {
    if (!user) return;

    const session = await startStudySession({
      userId: user.id,
      exam,
      subject,
      chapter: "",
      studyMode: mode,
      timerType,
      shift:
        new Date().getHours() < 12
          ? "Morning"
          : new Date().getHours() < 17
          ? "Afternoon"
          : "Evening",
    });

    console.log("Inserted session =", session);

    if (!session) {
      return;
    }
    setSessionId(session.id);

    setRunning(true);
    setPaused(false);
  }

  function pauseSession() {
    setRunning(false);
    setPaused(true);
  }

  function resumeSession() {
    setRunning(true);
    setPaused(false);
  }

  async function resetTimer() {
    setRunning(false);
    setPaused(false);

    if (sessionId && seconds > 0) {
      await finishStudySession(sessionId, seconds);
    }

    setSessionId(null);
    setSeconds(0);
  }

  // ==========================
  // RENDER
  // ==========================

  return (
    <section className="rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl">
      <div className="p-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="uppercase tracking-[4px] text-xs text-white/60">
              Focus Timer
            </p>
            <h2 className="text-3xl font-black mt-2">
              Deep Work Session
            </h2>
          </div>
          <div className="rounded-full bg-white/10 px-5 py-2 text-sm">
            {running && "🟢 Running"}
            {!running && paused && "🟡 Paused"}
            {!running && !paused && "⚪ Ready"}
          </div>
        </div>

        {/* Subject */}
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
            📚 {subject}
          </span>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
            ✍️ {mode}
          </span>
        </div>

        {/* Timer Type */}
        <div className="mt-10 flex rounded-2xl bg-white/10 p-1">
          <button
            onClick={async () => {
              setTimerType("stopwatch");
              await resetTimer();
            }}
            className={`flex-1 rounded-xl py-3 transition ${
              timerType === "stopwatch" ? "bg-blue-600" : ""
            }`}
          >
            <Clock3 size={18} className="inline mr-2" />
            Stopwatch
          </button>
          <button
            onClick={async () => {
              setTimerType("pomodoro");
              await resetTimer();
            }}
            className={`flex-1 rounded-xl py-3 transition ${
              timerType === "pomodoro" ? "bg-blue-600" : ""
            }`}
          >
            <Timer size={18} className="inline mr-2" />
            Pomodoro
          </button>
        </div>

        {/* Pomodoro Presets */}
        {timerType === "pomodoro" && (
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[25, 50, 90, 120].map((item) => (
              <button
                key={item}
                onClick={async () => {
                  setPomodoroMinutes(item);
                  await resetTimer();
                }}
                className={`rounded-xl py-3 transition ${
                  pomodoroMinutes === item ? "bg-blue-600" : "bg-white/10"
                }`}
              >
                {item}m
              </button>
            ))}
          </div>
        )}

        {/* Timer */}
        <div className="mt-12 flex justify-center">
          <div className="w-72 h-72 rounded-full border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-black tracking-wider">
                {display}
              </h1>
              <p className="mt-4 text-white/60">
                Stay Focused 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-12 flex justify-center gap-4">
          {!running && !paused && (
            <button
              onClick={startSession}
              className="bg-green-500 hover:bg-green-600 transition rounded-2xl px-6 py-4 flex items-center gap-2"
            >
              <Play size={18} />
              Start Focus
            </button>
          )}

          {running && (
            <button
              onClick={pauseSession}
              className="bg-yellow-500 hover:bg-yellow-600 transition rounded-2xl px-6 py-4 flex items-center gap-2"
            >
              <Pause size={18} />
              Pause
            </button>
          )}

          {!running && paused && (
            <button
              onClick={resumeSession}
              className="bg-green-500 hover:bg-green-600 transition rounded-2xl px-6 py-4 flex items-center gap-2"
            >
              <Play size={18} />
              Resume
            </button>
          )}

          <button
            onClick={resetTimer}
            className="bg-red-500 hover:bg-red-600 transition rounded-2xl px-6 py-4 flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>

        {/* Live Stats */}
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          <div className="rounded-2xl bg-white/5 p-5">
            <p className="text-white/60 text-sm">Today's Study</p>
            <h3 className="text-3xl font-black mt-2">
              {Math.floor(elapsedToday / 3600)}h{" "}
              {Math.floor((elapsedToday % 3600) / 60)}m
            </h3>
          </div>
          <div className="rounded-2xl bg-white/5 p-5">
            <p className="text-white/60 text-sm">Current Subject</p>
            <h3 className="text-2xl font-bold mt-2">{subject}</h3>
          </div>
          <div className="rounded-2xl bg-white/5 p-5">
            <p className="text-white/60 text-sm">Study Mode</p>
            <h3 className="text-xl font-bold mt-2">{mode}</h3>
          </div>
        </div>

        {/* Finish Session */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={async () => {
              setRunning(false);
              setPaused(false);

              if (sessionId) {
                await finishStudySession(sessionId, seconds);
              }

              setElapsedToday((prev) => prev + seconds);
              setSessionId(null);
              setSeconds(0);

              alert("🎉 Study session completed!");
              
              // TODO: 
              // refreshStats();
              // refreshSessions();
            }}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-8 py-4 font-bold transition"
          >
            ✅ Finish Session
          </button>
        </div>
      </div>
    </section>
  );
}