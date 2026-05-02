const goals = [
  { label: "Complete 1 Mock Test", done: true, xp: "+50 XP" },
  { label: "Revise 10 Formula Cards", done: true, xp: "+20 XP" },
  { label: "Solve 20 PYQs", done: false, progress: 13, total: 20, xp: "+30 XP" },
];

export default function DailyGoals() {
  const completed = goals.filter((g) => g.done).length;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-bold text-black uppercase tracking-widest">
            Daily Goals
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {completed} of {goals.length} completed today
          </p>
        </div>
        {/* Overall progress pill */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-500"
              style={{ width: `${(completed / goals.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-black">
            {Math.round((completed / goals.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {goals.map((goal) => (
          <div
            key={goal.label}
            className={`relative rounded-xl p-3.5 border transition-all duration-200
              ${goal.done
                ? "bg-gray-950 border-gray-900"
                : "bg-gray-50 border-gray-100 hover:border-gray-200"
              }`}
          >
            {/* Check / circle */}
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${goal.done
                    ? "bg-white border-white"
                    : "border-gray-300 bg-transparent"
                  }`}
              >
                {goal.done && (
                  <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                  ${goal.done
                    ? "bg-white/10 text-gray-300"
                    : "bg-gray-200 text-gray-500"
                  }`}
              >
                {goal.xp}
              </span>
            </div>

            <p
              className={`text-xs font-semibold leading-snug mb-2
                ${goal.done ? "text-gray-300 line-through" : "text-gray-700"}`}
            >
              {goal.label}
            </p>

            {/* Progress bar for incomplete goals */}
            {!goal.done && goal.total > 0 && (
              <div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {goal.progress}/{goal.total}
                </p>
              </div>
            )}

            {!goal.done && goal.total === 0 && (
              <p className="text-[10px] text-gray-400">Not started</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}