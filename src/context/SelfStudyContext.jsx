"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SelfStudyContext = createContext(null);

const STORAGE_KEY = "prepzii-study-session";

export function SelfStudyProvider({ children }) {
  const [loading, setLoading] = useState(true);

  // ===========================
  // USER
  // ===========================

  const [exam, setExam] = useState("JEE");

  // ===========================
  // STUDY
  // ===========================

  const [subject, setSubject] = useState("Physics");
  const [mode, setMode] = useState("Theory Reading");

  // ===========================
  // TIMER
  // ===========================

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [timerType, setTimerType] = useState("stopwatch");
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);

  // ===========================
  // SESSION
  // ===========================

  const [sessionId, setSessionId] = useState(null);

  // ===========================
  // STATS
  // ===========================

  const [elapsedToday, setElapsedToday] = useState(0);

  // ===========================
  // RESTORE
  // ===========================

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data = JSON.parse(saved);

        setExam(data.exam ?? "JEE");
        setSubject(data.subject ?? "Physics");
        setMode(data.mode ?? "Theory Reading");
        setTimerType(data.timerType ?? "stopwatch");
        setPomodoroMinutes(data.pomodoroMinutes ?? 25);
        setElapsedToday(data.elapsedToday ?? 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================
  // SAVE
  // ===========================

  useEffect(() => {
    if (loading) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        exam,
        subject,
        mode,
        timerType,
        pomodoroMinutes,
        elapsedToday,
      })
    );
  }, [
    loading,
    exam,
    subject,
    mode,
    timerType,
    pomodoroMinutes,
    elapsedToday,
  ]);

  return (
    <SelfStudyContext.Provider
      value={{
        loading,

        exam,
        setExam,

        subject,
        setSubject,

        mode,
        setMode,

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
      }}
    >
      {children}
    </SelfStudyContext.Provider>
  );
}

export function useSelfStudy() {
  const context = useContext(SelfStudyContext);

  if (!context) {
    throw new Error(
      "useSelfStudy must be used within SelfStudyProvider"
    );
  }

  return context;
}