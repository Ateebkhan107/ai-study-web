"use client";

import { TrendingUp, Flame } from "lucide-react";
import useStudyStats from "@/hooks/useStudyStats";
import { useSelfStudy } from "@/context/SelfStudyContext";

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  return `${hrs}h ${mins}m`;
}

export default function Hero() {
  const {
    loading,
    todaySeconds,
    yesterdaySeconds,
  } = useStudyStats();

  const { exam } = useSelfStudy();

  if (loading) {
    return (
      <section className="animate-pulse space-y-6">
        <div className="h-10 w-48 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-52 rounded-3xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-52 rounded-3xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </section>
    );
  }

  const diff = todaySeconds - yesterdaySeconds;

  const progress =
    yesterdaySeconds === 0
      ? 100
      : Math.min(
          100,
          Math.round((todaySeconds / yesterdaySeconds) * 100)
        );

  return (
    <section className="space-y-6">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-4 py-2 text-sm font-semibold">

            📚 {exam} Self Study

          </span>

          <h1 className="mt-5 text-5xl font-black tracking-tight">

            Focus Room

          </h1>

          <p className="mt-4 text-lg text-gray-500">

            Every minute counts. Stay consistent.

          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* TODAY */}

        <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">

          <p className="uppercase tracking-[3px] text-xs opacity-80">

            Today's Study

          </p>

          <h2 className="mt-4 text-6xl font-black">

            {formatTime(todaySeconds)}

          </h2>

          <div className="flex items-center gap-2 mt-5 opacity-90">

            <TrendingUp size={18} />

            {diff >= 0
              ? `+${formatTime(diff)} vs yesterday`
              : `${formatTime(Math.abs(diff))} less than yesterday`}

          </div>

        </div>

        {/* RIGHT */}

        <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-sm p-8">

          <div className="flex justify-between">

            <div>

              <p className="text-gray-500">

                Yesterday

              </p>

              <h2 className="mt-3 text-4xl font-black">

                {formatTime(yesterdaySeconds)}

              </h2>

            </div>

            <div className="text-right">

              <p className="text-gray-500">

                Progress

              </p>

              <h2 className="mt-3 text-4xl font-black">

                {progress}%

              </h2>

            </div>

          </div>

          <div className="mt-8">

            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          <div className="mt-6 flex items-center gap-2 text-orange-500 font-semibold">

            <Flame size={18} />

            Build your study streak every day.

          </div>

        </div>

      </div>

    </section>
  );
}