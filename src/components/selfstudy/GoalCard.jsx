"use client";

import { Target, TrendingUp } from "lucide-react";

export default function GoalCard() {
  const goal = 6; // hours
  const completed = 4.3;

  const progress = Math.min((completed / goal) * 100, 100);

  return (
    <section className="rounded-[30px] bg-white dark:bg-gray-900 shadow-sm p-7">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Today's Goal
          </p>

          <h2 className="text-2xl font-black mt-2">
            {completed.toFixed(1)}h / {goal}h
          </h2>

        </div>

        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">

          <Target className="text-blue-600" size={28} />

        </div>

      </div>

      <div className="mt-8">

        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">

          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      <div className="flex justify-between mt-5 text-sm">

        <span className="text-gray-400">

          {progress.toFixed(0)}% Complete

        </span>

        <span className="font-semibold text-blue-600">

          {(goal - completed).toFixed(1)}h left

        </span>

      </div>

      <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5">

        <div className="flex gap-3">

          <TrendingUp
            className="text-indigo-600 mt-0.5"
            size={20}
          />

          <div>

            <h3 className="font-bold">

              Keep Going 🚀

            </h3>

            <p className="text-sm text-gray-500 mt-1">

              Just 1.7 hours more to complete today's target.

            </p>

          </div>

        </div>

      </div>

    </section>
  );
}