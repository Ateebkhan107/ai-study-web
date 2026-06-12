const goals = [
  { label: "Complete 1 Mock Test", done: true, xp: "+50 XP" },
  { label: "Revise 10 Formula Cards", done: true, xp: "+20 XP" },
  { label: "Solve 20 PYQs", done: false, progress: 13, total: 20, xp: "+30 XP" },
];

export default function DailyGoals() {
  const completed = goals.filter((g) => g.done).length;

  return (
    <div className="bg-white dark:bg-[#1a1d2e] border border-gray-200 dark:border-[#2a2d3e] rounded-2xl p-5 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-bold text-black dark:text-[#e8eaf6] uppercase tracking-widest">
            Daily Goals
          </h2>

          <p className="text-xs text-gray-500 dark:text-[#9396a8] mt-0.5">
            {completed} of {goals.length} completed today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-200 dark:bg-[#232740] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(completed / goals.length) * 100}%` }}
            />
          </div>

          <span className="text-xs font-bold text-black dark:text-[#e8eaf6]">
            {Math.round((completed / goals.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {goals.map((goal) => (
          <div
            key={goal.label}
            className={`relative rounded-xl p-3.5 border transition-all duration-200
              ${
                goal.done
                  ? "bg-emerald-50 dark:bg-emerald-500/8 border-emerald-200 dark:border-emerald-500/20"
                  : "bg-gray-50 dark:bg-[#232740] border-gray-200 dark:border-[#2a2d3e] hover:border-gray-300 dark:hover:border-[#363a52]"
              }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${
                    goal.done
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-300 dark:border-[#363a52] bg-transparent"
                  }`}
              >
                {goal.done && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 10 10"
                  >
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                  ${
                    goal.done
                      ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
              >
                {goal.xp}
              </span>
            </div>

            <p
              className={`text-xs font-semibold leading-snug mb-2
                ${
                  goal.done
                    ? "text-emerald-600 dark:text-emerald-400 line-through decoration-emerald-500/40"
                    : "text-black dark:text-[#e8eaf6]"
                }`}
            >
              {goal.label}
            </p>

            {!goal.done && goal.total > 0 && (
              <div>
                <div className="w-full h-1 bg-gray-200 dark:bg-[#1a1d2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{
                      width: `${(goal.progress / goal.total) * 100}%`,
                    }}
                  />
                </div>

                <p className="text-[10px] text-gray-500 dark:text-[#5c5f74] mt-1">
                  {goal.progress}/{goal.total}
                </p>
              </div>
            )}

            {!goal.done && goal.total === 0 && (
              <p className="text-[10px] text-gray-500 dark:text-[#5c5f74]">
                Not started
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}