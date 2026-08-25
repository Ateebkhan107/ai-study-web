"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import { ClipboardList, Inbox } from "lucide-react";

export default function HistoryPage() {
  const { user } = useUser();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/test-attempts", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setTests(data.tests || []);
      } catch (error) {
        return;
      }

      setLoading(false);
    }

    if (user) {
      load();
    }
  }, [user]);

  if (loading) {
    return (
      <PageWrapper title="Test History" subtitle="Review your previous test attempts" badge="HISTORY" badgeIcon={<ClipboardList className="h-3.5 w-3.5" />}>
        <div className="flex justify-end mb-8">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 rounded-xl font-bold border border-slate-200/60 dark:border-[var(--border)]/50 bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl text-slate-700 dark:text-slate-200 hover:border-indigo-500/30 transition-all duration-300"
          >
            ← Back
          </button>
        </div>
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 shadow-sm p-6 animate-pulse skeleton-shimmer"
            >
              <div className="h-6 bg-slate-200 dark:bg-slate-700/50 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-3 gap-5">
                <div className="h-10 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
              </div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700/50 rounded w-full mt-6"></div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Test History" subtitle="Review your previous test attempts" badge="HISTORY" badgeIcon={<ClipboardList className="h-3.5 w-3.5" />}>
      <div className="flex items-center justify-between mb-8">
        <div></div>
        <button
          onClick={() => router.back()}
          className="px-5 py-2 rounded-xl font-bold border border-slate-200/60 dark:border-[var(--border)]/50 bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl text-slate-700 dark:text-slate-200 hover:border-indigo-500/30 transition-all duration-300"
        >
          ← Back
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-20 bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 shadow-sm animate-slideUp">
          <div className="mb-4 flex justify-center text-slate-400 dark:text-slate-500">
            <Inbox className="h-14 w-14" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No tests taken yet</h2>
          <p className="text-slate-400 dark:text-slate-500 mb-8">
              You haven&apos;t taken any mock tests yet. Start one now to track your progress!
          </p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-brand text-white font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {tests.map((test, index) => {
            const accuracy =
              test.attempted > 0 ? Math.round((test.correct_answers / test.attempted) * 100) : 0;

            return (
              <div
                key={test.id}
                className="glass-card bg-[var(--card)]/70 dark:bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-[var(--border)]/50 shadow-sm p-6 animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mock Test</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(test.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/test/review/${test.id}`)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-300"
                  >
                    Review Answers
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-slate-50/50 dark:bg-[var(--surface)]/50 p-4 rounded-2xl border border-slate-200/50 dark:border-[var(--border)]/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                      Score
                    </span>
                    <b className="text-xl text-indigo-600 dark:text-indigo-400">
                      {test.score}/{test.total_marks}
                    </b>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                      Accuracy
                    </span>
                    <b className="text-xl text-emerald-600 dark:text-emerald-400">{accuracy}%</b>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                      Questions
                    </span>
                    <b className="text-xl text-slate-700 dark:text-slate-200">{test.total_questions}</b>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
