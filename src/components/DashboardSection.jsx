const formulaCards = [
  {
    subject: "Physics",
    title: "Kinematic Equations",
    formula: "v = u + at",
    sub: "v² = u² + 2as",
    tag: "Mechanics",
  },
  {
    subject: "Chemistry",
    title: "Ideal Gas Law",
    formula: "PV = nRT",
    sub: "P = pressure, V = volume",
    tag: "Thermodynamics",
  },
  {
    subject: "Maths",
    title: "Quadratic Formula",
    formula: "x = (−b ± √(b²−4ac)) / 2a",
    sub: "For ax² + bx + c = 0",
    tag: "Algebra",
  },
  {
    subject: "Biology",
    title: "Hardy-Weinberg",
    formula: "p² + 2pq + q² = 1",
    sub: "p + q = 1",
    tag: "Genetics",
  },
];

const leaderboard = [
  { rank: 1, name: "Aryan Mehta", score: 98.4, tests: 61, badge: "🥇" },
  { rank: 2, name: "Priya Sharma", score: 97.1, tests: 58, badge: "🥈" },
  { rank: 3, name: "Rohan Das", score: 95.8, tests: 55, badge: "🥉" },
  { rank: 4, name: "Sneha Patel", score: 94.2, tests: 52, badge: null },
  { rank: 5, name: "Karan Verma", score: 93.0, tests: 50, badge: null },
];

const userRank = { rank: 214, name: "You", score: 91.6, tests: 48 };

export default function DashboardSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* Formula Cards */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Formula Cards
          </h2>
          <button className="text-xs text-gray-400 hover:text-white transition-colors font-medium">
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formulaCards.map((card) => (
            <div
              key={card.title}
              className="bg-white dark:bg-[#1a1d2e] border border-gray-100 dark:border-[#2a2d3e] rounded-xl p-4 hover:border-gray-200 dark:hover:border-[#363a52] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {card.subject}
                </span>
                <span className="text-[10px] bg-gray-50 dark:bg-[#232740] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-[#2a2d3e] px-2 py-0.5 rounded-full font-medium">
                  {card.tag}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {card.title}
              </p>
              <div className="bg-gray-50 dark:bg-[#232740] rounded-lg px-3 py-2.5 border border-gray-100 dark:border-[#2a2d3e] mb-2">
                <p className="font-mono text-sm font-bold text-black dark:text-white">
                  {card.formula}
                </p>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                {card.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Leaderboard
          </h2>
          <button className="text-xs text-gray-400 hover:text-white transition-colors font-medium">
            Full board →
          </button>
        </div>

        <div className="bg-white dark:bg-[#1a1d2e] border border-gray-100 dark:border-[#2a2d3e] rounded-xl overflow-hidden">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.name}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#232740] transition-colors
                ${i !== leaderboard.length - 1 ? "border-b border-gray-50 dark:border-[#2a2d3e]" : ""}
              `}
            >
              <div className="w-6 text-center">
                {entry.badge ? (
                  <span className="text-base leading-none">{entry.badge}</span>
                ) : (
                  <span className="text-xs font-semibold text-gray-400">#{entry.rank}</span>
                )}
              </div>
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#232740] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                {entry.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{entry.name}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{entry.tests} tests</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-black dark:text-white">{entry.score}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">score</p>
              </div>
            </div>
          ))}

          {/* Separator */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-dashed border-gray-200 dark:border-[#2a2d3e]">
            <div className="flex-1 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-gray-300 dark:bg-[#363a52]" />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">your rank</span>
            <div className="flex-1 flex justify-end gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-gray-300 dark:bg-[#363a52]" />
              ))}
            </div>
          </div>

          {/* User row */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-950 dark:bg-[#232740] border-l-2 border-l-indigo-500">
            <div className="w-6 text-center">
              <span className="text-xs font-semibold text-gray-400">#{userRank.rank}</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
              {userRank.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userRank.name}
                <span className="ml-1.5 text-[10px] font-normal text-gray-500">(you)</span>
              </p>
              <p className="text-[11px] text-gray-500">{userRank.tests} tests</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">{userRank.score}</p>
              <p className="text-[10px] text-gray-500">score</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}