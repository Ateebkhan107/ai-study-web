"use client";

import { useEffect, useMemo, useState } from "react";
import SubjectVisual from "@/components/SubjectVisual";

export default function OnboardingForm({
  action,
  accountTypes,
  exams,
  yearOptions,
  defaultYear,
  defaultFullName,
}) {
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    valid: false,
    available: false,
    message: "Choose a unique username.",
  });
  const normalizedUsername = useMemo(() => username.trim().toLowerCase(), [username]);

  useEffect(() => {
    const controller = new AbortController();

    async function checkUsername() {
      if (!normalizedUsername) {
        setUsernameStatus({
          checking: false,
          valid: false,
          available: false,
          message: "Choose a unique username.",
        });
        return;
      }

      if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
        setUsernameStatus({
          checking: false,
          valid: false,
          available: false,
          message: "Use 3-20 lowercase letters, numbers, or underscores.",
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
        const response = await fetch(`/api/username/availability?username=${encodeURIComponent(normalizedUsername)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to check username.");
        setUsernameStatus({
          checking: false,
          valid: Boolean(data.valid),
          available: Boolean(data.available),
          message: data.available ? "Available" : data.error || "Already taken",
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setUsernameStatus({
          checking: false,
          valid: false,
          available: false,
          message: "Unable to check username right now.",
        });
      }
    }

    const timeout = setTimeout(checkUsername, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [normalizedUsername]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="accountType" value={accountTypes.STUDENT} />
      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-400">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          defaultValue={defaultFullName}
          required
          minLength={3}
          maxLength={50}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-black dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] dark:text-white"
        />
      </div>

      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-400">
          Username
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
            @
          </span>
          <input
            type="text"
            name="username"
            placeholder="your_username"
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]{3,20}"
            autoComplete="username"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pl-8 text-sm font-medium text-black dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] dark:text-white"
          />
        </div>
        <p
          className={`mt-2 text-xs font-semibold ${
            usernameStatus.available
              ? "text-emerald-600 dark:text-emerald-400"
              : usernameStatus.checking
                ? "text-gray-400"
                : "text-amber-600 dark:text-amber-300"
          }`}
        >
          {usernameStatus.message}
        </p>
      </div>

      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-400">
          Student Exam Target
        </label>
        <div className="grid grid-cols-2 gap-3">
          {exams.map((exam) => (
            <label
              key={exam}
              className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-semibold text-black dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] dark:text-white"
            >
              <SubjectVisual
                subject={exam === "NEET" ? "Biology" : "Maths"}
                className="pointer-events-none absolute -bottom-7 -right-5 h-24 w-24 text-slate-900 opacity-[0.035] dark:text-white dark:opacity-[0.055]"
              />
              <input
                type="radio"
                name="targetExam"
                value={exam}
                defaultChecked={exam === "JEE"}
                className="relative z-10 h-4 w-4"
              />
              <span className="relative z-10">{exam}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="targetYear"
          className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-400"
        >
          Target Year
        </label>
        <select
          id="targetYear"
          name="targetYear"
          defaultValue={defaultYear}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-black dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] dark:text-white"
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={!usernameStatus.available}
        className="w-full rounded-2xl bg-brand py-3.5 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:text-white"
      >
        Continue to Dashboard
      </button>
    </form>
  );
}
