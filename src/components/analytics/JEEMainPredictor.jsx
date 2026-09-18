"use client";
import React, { useState, useMemo } from "react";
import { Brain, Sparkles, AlertCircle, ChevronDown, CheckCircle2, AlertTriangle, Target, Search } from "lucide-react";
import jeeMarksPercentile from "../../data/admission/jee-main/marks-percentile-2026.json";
import josaaCutoffs from "../../data/admission/josaa/cutoffs-2026.json";

function interpolatePercentile(score) {
  const data = jeeMarksPercentile.data;
  const s = Math.max(0, Math.min(data[0].score, score));
  for (let i = 0; i < data.length - 1; i++) {
    const high = data[i];
    const low = data[i + 1];
    if (s <= high.score && s >= low.score) {
      const range = high.score - low.score;
      const ratio = range === 0 ? 0 : (s - low.score) / range;
      const pct = low.percentile + ratio * (high.percentile - low.percentile);
      return pct.toFixed(2);
    }
  }
  return "0.00";
}

function calculateRank(percentile, totalCandidates) {
  const rank = Math.round(((100 - parseFloat(percentile)) / 100) * totalCandidates);
  return Math.max(1, rank);
}

export default function JEEMainPredictor({ stats }) {
  const accuracy = stats?.overview?.overallAccuracy;
  const totalQuestions = stats?.counts?.answeredQuestions || stats?.overview?.questionsPracticed || 0;
  const averageTestScore = stats?.overview?.averageScore;
  const hasSample = typeof accuracy === "number" && totalQuestions >= 10;
  const totalCandidates = jeeMarksPercentile.totalCandidates;

  const [category, setCategory] = useState("OPEN");
  const [gender, setGender] = useState("Gender-Neutral");
  const [branch, setBranch] = useState("Computer Science and Engineering");

  // Basic calculation logic mimicking realistic scenarios
  let finalScore = null;
  let hasData = false;
  let percentile = "—";
  let rankEstimate = "—";
  let rawRank = 0;
  let rankRange = "";
  let confidence = "Calibrating";

  if (hasSample) {
    hasData = true;
    const safeAccuracy = Math.max(0, accuracy - 3);
    const simulatedAttempted = Math.round(Math.min(72, Math.max(30, 28 + (safeAccuracy / 100) * 40)));
    const correct = Math.round(simulatedAttempted * (safeAccuracy / 100));
    const incorrect = simulatedAttempted - correct;
    const practiceScore = Math.max(0, Math.min(300, (correct * 4) - (incorrect * 1)));

    finalScore = practiceScore;
    if (typeof averageTestScore === "number" && averageTestScore > 0) {
      const mockScore = Math.round((averageTestScore / 100) * 300);
      finalScore = Math.round(practiceScore * 0.35 + mockScore * 0.65);
    }

    percentile = interpolatePercentile(finalScore);
    rawRank = calculateRank(percentile, totalCandidates);
    
    // Rank Range
    const rankMin = Math.max(1, Math.round(rawRank * 0.9));
    const rankMax = Math.min(totalCandidates, Math.round(rawRank * 1.15));
    
    rankEstimate = `~${(rawRank / 100000).toFixed(2)}L AIR`;
    if (rawRank < 1000) rankEstimate = `~${rawRank} AIR`;
    else if (rawRank < 100000) rankEstimate = `~${(rawRank / 1000).toFixed(1)}K AIR`;

    rankRange = rawRank < 1000 ? `${rankMin} - ${rankMax}` : `${(rankMin / 100000).toFixed(2)}L - ${(rankMax / 100000).toFixed(2)}L`;

    confidence = totalQuestions > 80 ? "High Confidence" : "Moderate Confidence";
  } else if (totalQuestions > 0 && typeof accuracy === "number") {
    // Limited data
    const safeAcc = Math.max(0, accuracy - 3);
    const simulatedAttempted = Math.round(Math.min(72, Math.max(28, 25 + (safeAcc / 100) * 42)));
    const correct = Math.round(simulatedAttempted * (safeAcc / 100));
    const incorrect = simulatedAttempted - correct;
    finalScore = Math.max(0, Math.min(300, (correct * 4) - (incorrect * 1)));
    
    percentile = interpolatePercentile(finalScore);
    rawRank = calculateRank(percentile, totalCandidates);
    rankEstimate = `~${(rawRank / 100000).toFixed(2)}L AIR`;
    if (rawRank < 1000) rankEstimate = `~${rawRank} AIR`;
    else if (rawRank < 100000) rankEstimate = `~${(rawRank / 1000).toFixed(1)}K AIR`;
    
    confidence = "Low confidence — limited attempts";
  }

  const matchedColleges = useMemo(() => {
    if (!hasData && !finalScore) return { likely: [], possible: [], stretch: [] };
    
    const likely = [];
    const possible = [];
    const stretch = [];

    josaaCutoffs.data.forEach(c => {
      // Basic filtering
      if (c.category !== category) return;
      if (c.gender !== gender && c.gender !== "Gender-Neutral") return;
      if (branch !== "Any" && !c.branch.includes(branch)) return;

      const diff = c.closingRank - rawRank;
      
      // Categorization
      if (rawRank <= c.closingRank * 0.8) {
        likely.push(c);
      } else if (rawRank <= c.closingRank * 1.1) {
        possible.push(c);
      } else if (rawRank <= c.closingRank * 1.5) {
        stretch.push(c);
      }
    });

    return { likely: likely.slice(0, 3), possible: possible.slice(0, 3), stretch: stretch.slice(0, 3) };
  }, [rawRank, category, gender, branch, hasData, finalScore]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-[var(--card)] p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />
      
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:bg-blue-500/20">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
              JEE Main Score & College Predictor
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Data updated: {josaaCutoffs.year} JoSAA Round 6 | Prediction data: JEE Main {jeeMarksPercentile.year}
            </p>
          </div>
        </div>
        {hasData && (
          <span className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-300">
            <span className={`h-2 w-2 rounded-full ${confidence === 'High Confidence' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {confidence}
          </span>
        )}
      </div>

      {!hasData && finalScore === null ? (
        <div className="mt-6 flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Not enough data yet</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Complete more practice questions to calculate your personalized estimate.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Left Column: Stats */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Estimated Score</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-black tabular-nums text-slate-950 dark:text-white">{finalScore}</span>
                    <span className="text-sm font-bold text-slate-500">/ 300</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Percentile</p>
                  <p className="mt-1 font-display text-2xl font-black text-slate-900 dark:text-slate-100">~{percentile}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Estimated AIR</p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-display text-3xl font-black text-blue-600 dark:text-blue-400">{rankEstimate}</span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-500">Expected range: {rankRange}</p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-200/70">
                  Estimates are based on available JEE Main and JoSAA data. Actual percentile, rank and admission depend on NTA normalization, final rank, category, quota, counselling round and seat availability.<br/><br/>
                  <strong>Note:</strong> IIT admission depends exclusively on JEE Advanced rank, not JEE Main AIR.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: College Predictor */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200/80 bg-white p-5 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/10">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Search className="h-4 w-4" /> College Chances
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="EWS">EWS</option>
                  <option value="OBC-NCL">OBC-NCL</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Preferred Branch</label>
                <select 
                  value={branch} 
                  onChange={e => setBranch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                >
                  <option value="Any">Any Branch</option>
                  <option value="Computer Science and Engineering">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics and Communication Engineering">Electronics & Comm.</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            </div>

            {matchedColleges.likely.length === 0 && matchedColleges.possible.length === 0 && matchedColleges.stretch.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg dark:border-slate-700">
                <p className="text-sm text-slate-500">No matching colleges found for this criteria.</p>
                <p className="text-xs text-slate-400 mt-1">Try changing your preferences or boosting your score.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedColleges.likely.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Likely
                    </h4>
                    <div className="space-y-2">
                      {matchedColleges.likely.map((c, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.institute}</p>
                            <p className="text-[10px] text-slate-500 truncate w-48">{c.branch}</p>
                          </div>
                          <p className="text-[10px] font-medium text-slate-400">Closing: {c.closingRank}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {matchedColleges.possible.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-amber-500 mb-2 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-400"></span> Possible
                    </h4>
                    <div className="space-y-2">
                      {matchedColleges.possible.map((c, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.institute}</p>
                            <p className="text-[10px] text-slate-500 truncate w-48">{c.branch}</p>
                          </div>
                          <p className="text-[10px] font-medium text-slate-400">Closing: {c.closingRank}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchedColleges.stretch.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-orange-500 mb-2 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-orange-500"></span> Stretch
                    </h4>
                    <div className="space-y-2">
                      {matchedColleges.stretch.map((c, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.institute}</p>
                            <p className="text-[10px] text-slate-500 truncate w-48">{c.branch}</p>
                          </div>
                          <p className="text-[10px] font-medium text-slate-400">Closing: {c.closingRank}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
