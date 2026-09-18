import re

with open('src/components/analytics/NEETPredictor.jsx', 'r') as f:
    content = f.read()

# I will insert the graph between Results Hero and Graph & Simulator Grid
graph_code = """
        {/* Score vs Rank Historical Graph */}
        <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-[var(--surface-elevated)]/10 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-brand" /> Score vs Rank Distribution
          </h3>
          <div className="relative w-full h-64">
            <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible">
              {/* Axes */}
              <line x1="50" y1="250" x2="950" y2="250" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-700" />
              <line x1="50" y1="20" x2="50" y2="250" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-700" />
              
              {/* Y Axis Labels (Rank) */}
              <text x="40" y="30" fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="end">1</text>
              <text x="40" y="140" fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="end">50K</text>
              <text x="40" y="250" fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="end">100K+</text>

              {/* X Axis Labels (Score) */}
              <text x="50" y="270" fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="middle">500</text>
              <text x="275" y="270" fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="middle">555</text>
              <text x="500" y="270" fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="middle">610</text>
              <text x="725" y="270" fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="middle">665</text>
              <text x="950" y="270" fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="middle">720</text>
              
              {/* Plotting historical bands as a curve */}
              <path 
                d="M 50 250 Q 500 240 700 150 T 950 30" 
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />

              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>

              {/* User Point */}
              <circle 
                cx={50 + ((Math.max(500, Math.min(720, currentScoreData.score)) - 500) / 220) * 900} 
                cy={250 - (Math.max(0, Math.min(100000, forecast.rankMedian)) / 100000) * 220} 
                r="6" 
                className="fill-brand stroke-white dark:stroke-slate-900" 
                strokeWidth="3" 
              />
              <text 
                x={50 + ((Math.max(500, Math.min(720, currentScoreData.score)) - 500) / 220) * 900} 
                y={250 - (Math.max(0, Math.min(100000, forecast.rankMedian)) / 100000) * 220 - 15}
                fontSize="12" 
                fontWeight="bold"
                fill="currentColor" 
                className="text-slate-800 dark:text-slate-200" 
                textAnchor="middle"
              >
                You
              </text>
            </svg>
          </div>
        </div>
"""

new_content = content.replace("{/* Graph & Simulator Grid */}", graph_code + "\n        {/* Graph & Simulator Grid */}")

with open('src/components/analytics/NEETPredictor.jsx', 'w') as f:
    f.write(new_content)
