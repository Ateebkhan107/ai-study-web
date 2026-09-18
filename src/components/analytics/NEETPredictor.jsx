
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Brain, Sparkles, TrendingUp, Info, Calculator, CheckCircle2, XCircle, MinusCircle, BarChart3, SlidersHorizontal } from "lucide-react";
import { calculateNEETScore, calculateSubjectScore, validateNEETInputs, NEET_MAX_SCORE } from "../../lib/neet/scoring";
import { forecastRank } from "../../lib/neet/rankForecast";
import { getAvailableYears } from "../../lib/neet/historicalData";

// Subject Input Component
const SubjectInput = ({ label, data, onChange }) => {
  const total = data.correct + data.incorrect + data.unanswered;
  const error = total !== (label === "Biology" ? 90 : 45) ? `Total must be ${label === "Biology" ? 90 : 45}` : null;
  
  return (
    <div className="rounded-xl border border-slate-200/60 p-4 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[var(--surface-elevated)]/20">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{label}</h4>
        {error && <span className="text-xs font-bold text-red-500">{error}</span>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> Correct</label>
          <input type="number" min="0" value={data.correct} onChange={(e) => onChange('correct', parseInt(e.target.value) || 0)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-brand" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><XCircle className="w-3 h-3 text-red-500"/> Incorrect</label>
          <input type="number" min="0" value={data.incorrect} onChange={(e) => onChange('incorrect', parseInt(e.target.value) || 0)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-brand" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><MinusCircle className="w-3 h-3 text-slate-400"/> Unanswered</label>
          <input type="number" min="0" value={data.unanswered} onChange={(e) => onChange('unanswered', parseInt(e.target.value) || 0)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-brand" />
        </div>
      </div>
    </div>
  );
};

export default function NEETPredictor({ stats }) {
  const initialAccuracy = stats?.overview?.overallAccuracy || 0;
  const totalQuestions = stats?.counts?.answeredQuestions || 0;
  const hasSample = totalQuestions >= 10;
  
  // Try to default to realistic numbers based on their accuracy
  const initialCorrect = hasSample ? Math.round(180 * (initialAccuracy / 100)) : 120;
  const initialIncorrect = hasSample ? 180 - initialCorrect : 40;

  const [mode, setMode] = useState("marks");
  const [expectedMarks, setExpectedMarks] = useState(hasSample ? (initialCorrect * 4) - initialIncorrect : 440);
  const [attempts, setAttempts] = useState({
    physics: { correct: Math.floor(initialCorrect / 4), incorrect: Math.floor(initialIncorrect / 4), unanswered: 45 - Math.floor(initialCorrect / 4) - Math.floor(initialIncorrect / 4) },
    chemistry: { correct: Math.floor(initialCorrect / 4), incorrect: Math.floor(initialIncorrect / 4), unanswered: 45 - Math.floor(initialCorrect / 4) - Math.floor(initialIncorrect / 4) },
    biology: { correct: Math.floor(initialCorrect / 2), incorrect: Math.floor(initialIncorrect / 2), unanswered: 90 - Math.floor(initialCorrect / 2) - Math.floor(initialIncorrect / 2) },
  });

  const availableYears = getAvailableYears();
  const [targetYear, setTargetYear] = useState(availableYears[0]);
  
  // Simulator State
  const [simDeltaCorrect, setSimDeltaCorrect] = useState(0);

  const currentScoreData = useMemo(() => {
    if (mode === "marks") {
      const score = Math.max(-180, Math.min(720, parseInt(expectedMarks) || 0));
      return { score, percentage: (score / 720) * 100, isEstimate: true };
    } else {
      const totalCorrect = attempts.physics.correct + attempts.chemistry.correct + attempts.biology.correct;
      const totalIncorrect = attempts.physics.incorrect + attempts.chemistry.incorrect + attempts.biology.incorrect;
      const totalUnanswered = attempts.physics.unanswered + attempts.chemistry.unanswered + attempts.biology.unanswered;
      return {
        ...calculateNEETScore(totalCorrect, totalIncorrect, totalUnanswered),
        phyScore: calculateSubjectScore(attempts.physics.correct, attempts.physics.incorrect),
        chemScore: calculateSubjectScore(attempts.chemistry.correct, attempts.chemistry.incorrect),
        bioScore: calculateSubjectScore(attempts.biology.correct, attempts.biology.incorrect),
        isEstimate: false,
      };
    }
  }, [mode, expectedMarks, attempts]);

  const simScore = Math.min(720, Math.max(0, currentScoreData.score + (simDeltaCorrect * 5))); // +4 for correct, +1 back from not being incorrect = 5 mark swing

  const forecast = useMemo(() => forecastRank(currentScoreData.score, targetYear), [currentScoreData.score, targetYear]);
  const simForecast = useMemo(() => forecastRank(simScore, targetYear), [simScore, targetYear]);

  const updateSubject = (subject, field, value) => {
    setAttempts(prev => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: value }
    }));
  };

  const getAIInsight = () => {
    if (currentScoreData.score > 680) return "Excellent! A score in this range historically places you in the top tier, likely securing a seat in premium government medical colleges (e.g., AIIMS). Minimize silly mistakes to hold this rank.";
    if (currentScoreData.score > 600) return "Strong performance. This historically places you in a safe zone for government college cutoffs in most states. Gaining just 10-20 more marks can dramatically improve your rank due to the dense clustering in this range.";
    if (currentScoreData.score > 500) return "Good potential, but competitive for government seats. At this tier, every extra correct answer can jump you ahead of thousands of candidates. Focus on high-yield biology chapters to quickly push past 600.";
    return "This score range suggests fundamental gaps. Focus heavily on NCERT basics, especially in Biology, which accounts for 50% of the exam weight. Prioritize accuracy over attempting too many questions.";
  };

  return (
    <div className="space-y-6 animate-slideUp" style={{ animationDelay: "100ms" }}>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--card)] sm:p-8">
        
        {/* Header */}
        <div className="flex flex-wrap gap-4 justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand" />
              AI Score & Rank Forecaster
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Estimate your NEET score, AIR range and percentile using historical data.</p>
          </div>
          <select 
            value={targetYear} 
            onChange={e => setTargetYear(parseInt(e.target.value))}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300"
          >
            {availableYears.map(y => <option key={y} value={y}>Target: NEET {y}</option>)}
          </select>
        </div>

        {/* Input Toggle */}
        <div className="mb-6 flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-fit">
          <button 
            onClick={() => setMode("marks")}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${mode === "marks" ? "bg-white dark:bg-slate-700 shadow-sm text-brand" : "text-slate-500"}`}
          >
            Marks Based
          </button>
          <button 
            onClick={() => setMode("attempts")}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${mode === "attempts" ? "bg-white dark:bg-slate-700 shadow-sm text-brand" : "text-slate-500"}`}
          >
            Attempt Based
          </button>
        </div>

        {/* Inputs */}
        {mode === "marks" ? (
          <div className="mb-8 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[var(--surface-elevated)]/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Marks</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={expectedMarks} 
                  onChange={(e) => setExpectedMarks(e.target.value)} 
                  className="w-32 text-2xl font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand"
                />
                <span className="text-xl font-black text-slate-400">/ 720</span>
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              <Info className="inline w-4 h-4 mr-1 -mt-0.5" />
              Enter your expected raw score to see the historical rank projection.
            </div>
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SubjectInput label="Physics" data={attempts.physics} onChange={(f, v) => updateSubject('physics', f, v)} />
            <SubjectInput label="Chemistry" data={attempts.chemistry} onChange={(f, v) => updateSubject('chemistry', f, v)} />
            <SubjectInput label="Biology" data={attempts.biology} onChange={(f, v) => updateSubject('biology', f, v)} />
          </div>
        )}

        {/* Results Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <div className="flex flex-col justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900/20 border border-indigo-100 dark:border-indigo-900/30">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">Total Score</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-display font-black text-slate-900 dark:text-white">{currentScoreData.score}</span>
              <span className="text-xl font-bold text-slate-400">/ 720</span>
            </div>
            <p className="text-sm font-semibold text-slate-500">{currentScoreData.percentage?.toFixed(2)}% Percentage</p>
            
            {!currentScoreData.isEstimate && (
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Physics</p>
                  <p className="font-black text-slate-700 dark:text-slate-300">{currentScoreData.phyScore} <span className="text-xs font-normal opacity-50">/180</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Chemistry</p>
                  <p className="font-black text-slate-700 dark:text-slate-300">{currentScoreData.chemScore} <span className="text-xs font-normal opacity-50">/180</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Biology</p>
                  <p className="font-black text-slate-700 dark:text-slate-300">{currentScoreData.bioScore} <span className="text-xs font-normal opacity-50">/360</span></p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-[var(--surface-elevated)]/30 border border-slate-200/60 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Estimated AIR</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-display font-black text-brand">~{forecast.rankMedian.toLocaleString()}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-slate-800 text-xs font-bold w-fit mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Range: {forecast.rankMin.toLocaleString()} – {forecast.rankMax.toLocaleString()}
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-800/80 pt-4">
              <span>Percentile Estimate</span>
              <span>{forecast.percentile.toFixed(4)} %ile</span>
            </div>
          </div>
          
        </div>
        
        
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

        {/* Graph & Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* AI Insight */}
          <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/10 p-5">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" /> AI Performance Insight
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {getAIInsight()}
            </p>
          </div>

          {/* Simulator */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[var(--surface-elevated)]/20 p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-brand" /> &quot;What If?&quot; Simulator
            </h3>
            <p className="text-xs text-slate-500 mb-4">See how converting mistakes to correct answers affects your rank dynamically.</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Convert Mistakes to Correct: <span className="text-brand">+{simDeltaCorrect} Qs</span></span>
                <span>+{simDeltaCorrect * 5} Marks</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={simDeltaCorrect} 
                onChange={(e) => setSimDeltaCorrect(parseInt(e.target.value))}
                className="w-full accent-brand"
              />
            </div>
            
            {simDeltaCorrect > 0 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">New Score</p>
                  <p className="font-black text-slate-900 dark:text-white">{simScore}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">New Proj. AIR</p>
                  <p className="font-black text-emerald-500">~{simForecast.rankMedian.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Disclaimer */}
        <p className="text-[11px] text-center text-slate-400 max-w-2xl mx-auto flex items-start gap-1">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Rank and percentile shown by PrepZii are statistical estimates based on available historical NTA data. Actual results depend on the official NEET result, tie-breaking rules, and yearly candidate performance distributions. Not an official rank.
        </p>
        
      </div>
    </div>
  );
}
