"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, GraduationCap } from "lucide-react";
import SubjectVisual from "@/components/SubjectVisual";

export default function OnboardingForm({
  action,
  accountTypes,
  exams,
  yearOptions,
  defaultYear,
  defaultFullName,
}) {
  const [accountType, setAccountType] = useState(accountTypes.STUDENT);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    valid: false,
    available: false,
    message: "Choose a unique username.",
  });
  const isStudent = accountType === accountTypes.STUDENT;
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

  const optionClass = (active) =>
    `flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
      active
        ? "border-indigo-300 bg-indigo-50 text-black ring-2 ring-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-white dark:ring-indigo-500/10"
        : "border-gray-200 bg-gray-50 text-black hover:border-gray-300 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] dark:text-white"
    }`;

  return (
    <form action={action} className="space-y-6">
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
          I am joining as
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={optionClass(isStudent)}>
            <input
              type="radio"
              name="accountType"
              value={accountTypes.STUDENT}
              checked={isStudent}
              onChange={() => setAccountType(accountTypes.STUDENT)}
              className="mt-1 h-4 w-4"
            />
            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <span>
              <span className="block font-black">Student</span>
              <span className="mt-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Personal PrepZii prep. Institute appears only if you are added.
              </span>
            </span>
          </label>

          <label className={optionClass(!isStudent)}>
            <input
              type="radio"
              name="accountType"
              value={accountTypes.INSTITUTE_ADMIN}
              checked={!isStudent}
              onChange={() => setAccountType(accountTypes.INSTITUTE_ADMIN)}
              className="mt-1 h-4 w-4"
            />
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <span>
              <span className="block font-black">Institute Admin</span>
              <span className="mt-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Manage coaching workspace tools after your institute access is active.
              </span>
            </span>
          </label>
        </div>
      </div>

      {isStudent && (
        <>
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
        </>
      )}

      <button
        type="submit"
        disabled={!usernameStatus.available}
        className="w-full rounded-2xl bg-brand py-3.5 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:text-white"
      >
        {isStudent ? "Continue to Dashboard" : "Continue to Institute"}
      </button>
    </form>
  );
}
