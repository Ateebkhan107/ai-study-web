"use client";
import { Atom, FlaskConical, Calculator, Dna, Target } from "lucide-react";

const IconMap = {
  "atom": <Atom className="w-5 h-5" />,
  "flask-conical": <FlaskConical className="w-5 h-5" />,
  "calculator": <Calculator className="w-5 h-5" />,
  "dna": <Dna className="w-5 h-5" />
};

export default function ExamHub({ config }) {
  return (
    <div className="relative overflow-hidden w-full rounded-3xl border border-gray-200/80 bg-gradient-to-br from-sky-400/10 via-white/80 to-sky-100/30 p-6 shadow-xl shadow-sky-500/[0.03] dark:border-gray-800/60 dark:bg-gradient-to-br dark:from-[#161b22]/80 dark:via-[#0d1117]/60 dark:to-[#161b22]/40 backdrop-blur-md">
      
      {/* Visual Ambient Background Layer */}
      <div className={`absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl ${config.themeGlow} rounded-full filter blur-[60px] pointer-events-none opacity-70`} />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        
        {/* Left Focus Block: User Context */}
        <div className="space-y-3 max-w-md">
          <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${config.badgeStyles}`}>
            {config.badge}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {config.dashboardTitle}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            Your personalized performance analytics engine is completely optimized for your targeted goal tracking criteria.
          </p>
        </div>

        {/* Center Focus Block: High-Yield Progress Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-2xl w-full">
          {config.subjects.map((sub) => (
            <div key={sub.id} className="bg-white/60 border border-gray-200/50 dark:bg-[#0d1117]/60 dark:border-gray-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{sub.label}</span>
                <span className="text-base text-gray-500">{IconMap[sub.icon] || <Atom className="w-5 h-5" />}</span>
              </div>
              <div className="space-y-1">
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className={`bg-gradient-to-r ${sub.color} h-full rounded-full`} style={{ width: "65%" }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-bold">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Focus Block: Todays Schedule */}
        <div className="bg-white/80 border border-gray-200/60 dark:bg-[#161b22]/50 dark:border-gray-800/80 p-4 rounded-2xl w-full xl:w-72 shadow-sm shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            <Target className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" /> Today&apos;s Focus Topics
          </p>
          <div className="space-y-2.5">
            {config.focusTopics.map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs border-b border-gray-100 dark:border-gray-800/50 pb-2 last:border-none last:pb-0">
                <div className="truncate max-w-[150px]">
                  <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{topic.topic}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{topic.subject}</p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-sky-500/5 text-sky-500 border border-sky-500/10 dark:bg-sky-400/5 dark:text-sky-400">
                  {topic.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
