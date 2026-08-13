"use client";

// NOTE: This page uses 'use client' solely for Framer Motion animations.
// All CTA navigation uses <Link> so crawlers and prefetching work correctly.
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import {
  Target,
  Trophy,
  Flame,
  BookOpen,
  CheckCircle2,
  Activity,
  Sparkles,
  TestTube2,
  LineChart,
  Brain,
  History,
  Users,
  ShieldCheck,
  ChevronRight,
  BarChart,
  Globe
} from "lucide-react";

const SCIENCE_PARTICLES = [
  { size: 3, top: 12, left: 8, y: -90, duration: 16, delay: 0.5 },
  { size: 5, top: 18, left: 76, y: -130, duration: 19, delay: 2 },
  { size: 4, top: 28, left: 34, y: -80, duration: 14, delay: 1.4 },
  { size: 3, top: 42, left: 88, y: -120, duration: 21, delay: 3.2 },
  { size: 6, top: 54, left: 16, y: -95, duration: 18, delay: 4 },
  { size: 4, top: 64, left: 62, y: -140, duration: 20, delay: 1.1 },
  { size: 3, top: 72, left: 45, y: -75, duration: 15, delay: 2.8 },
  { size: 5, top: 82, left: 24, y: -110, duration: 17, delay: 5 },
  { size: 4, top: 8, left: 52, y: -100, duration: 22, delay: 0.2 },
  { size: 3, top: 36, left: 6, y: -85, duration: 16, delay: 3.7 },
  { size: 5, top: 48, left: 72, y: -125, duration: 19, delay: 2.4 },
  { size: 4, top: 58, left: 92, y: -90, duration: 18, delay: 4.6 },
  { size: 3, top: 70, left: 8, y: -105, duration: 20, delay: 1.9 },
  { size: 5, top: 86, left: 68, y: -135, duration: 23, delay: 3 },
  { size: 4, top: 94, left: 39, y: -95, duration: 17, delay: 5.5 },
];

function BackgroundScience() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] left-[-10%] h-[min(800px,120vw)] w-[min(800px,120vw)] rounded-full border border-indigo-500/10 border-dashed"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[-10%] h-[min(600px,100vw)] w-[min(600px,100vw)] rounded-full border border-purple-500/10 border-dotted"
      />
      {SCIENCE_PARTICLES.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute bg-indigo-500/20 rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
          }}
          animate={{
            y: [0, particle.y],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay
          }}
        />
      ))}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative w-full max-w-5xl mx-auto h-[450px] sm:h-[550px] perspective-[1000px] mt-16 z-20">
      <motion.div 
        initial={{ opacity: 0, y: 80, rotateX: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3, type: "spring", bounce: 0.3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[700px] bg-[#020617]/80 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/20"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Target className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold">Today&apos;s Goal</h3>
              <p className="text-sm text-slate-400">Master Rotational Mechanics</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-3xl font-bold text-white">42<span className="text-sm text-slate-400 ml-1">/50 PYQs</span></span>
          </div>
        </div>
        
        <div className="w-full bg-slate-800/60 rounded-full h-3 overflow-hidden mb-8 border border-slate-700/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "84%" }}
            transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
           <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
             <div className="flex items-center gap-3 mb-3">
               <Activity className="w-5 h-5 text-emerald-400" />
               <span className="text-sm font-medium text-slate-300">Physics Accuracy</span>
             </div>
             <span className="text-2xl font-bold text-white">88%</span>
           </div>
           <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
             <div className="flex items-center gap-3 mb-3">
               <Trophy className="w-5 h-5 text-yellow-400" />
               <span className="text-sm font-medium text-slate-300">Total XP</span>
             </div>
             <span className="text-2xl font-bold text-white">12,450</span>
           </div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-[2%] sm:left-[5%] w-[180px] bg-[#0f172a]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] z-30 hidden sm:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-slate-300">Current Streak</span>
        </div>
        <span className="text-2xl font-bold text-white">14 <span className="text-sm text-slate-400 font-normal">Days</span></span>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-[2%] sm:right-[5%] w-[220px] bg-[#0f172a]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] z-30"
      >
        <div className="flex items-center gap-2 mb-3">
          <TestTube2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-slate-300">Next Mock Test</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg inline-block">
          <span className="text-sm font-semibold text-emerald-300">JEE Advanced Full</span>
        </div>
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-24 right-[1%] sm:right-[2%] w-[180px] bg-[#0f172a]/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.15)] z-10 hidden md:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium text-slate-300">Formula Book</span>
        </div>
        <span className="text-lg font-bold text-white block">+24 Revised</span>
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-20 left-[1%] sm:left-[2%] w-[200px] bg-[#0f172a]/95 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(244,63,94,0.15)] z-10 hidden md:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-medium text-slate-300">Weak Chapter</span>
        </div>
        <span className="text-sm font-bold text-white block truncate">Thermodynamics</span>
        <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
          <div className="w-[30%] h-full bg-rose-400 rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
}

function JourneyStep({ icon: Icon, title, desc, delay, isLast }) {
  return (
    <div className="relative flex flex-col items-center text-center max-w-[160px] group">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay, duration: 0.5, type: "spring" }}
        className="w-20 h-20 rounded-2xl bg-[#0f172a]/80 backdrop-blur-md border border-indigo-500/20 flex items-center justify-center mb-5 relative z-10 group-hover:border-indigo-500/60 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300"
      >
        <Icon className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
      </motion.div>
      <motion.h4 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.2 }}
        className="text-white font-bold mb-2"
      >
        {title}
      </motion.h4>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3 }}
        className="text-xs text-slate-400 leading-relaxed"
      >
        {desc}
      </motion.p>
      {!isLast && (
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          whileInView={{ opacity: 1, width: "100%" }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.4, duration: 0.5 }}
          className="hidden lg:block absolute top-10 left-[70%] w-full h-[2px] bg-gradient-to-r from-indigo-500/40 to-transparent z-0 origin-left"
        />
      )}
    </div>
  );
}

function PillarCard({ icon: Icon, title, items, colorClass, gradientClass, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -5 }}
      className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-[32px] hover:border-slate-600 transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${colorClass} transition-transform group-hover:scale-110 duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function TrustCard({ title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-start gap-4 p-6 rounded-2xl bg-[#0f172a]/40 border border-indigo-500/10 hover:bg-[#0f172a]/60 hover:border-indigo-500/20 transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      </div>
      <div>
        <h4 className="text-white font-bold text-lg mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30 relative">
      <BackgroundScience />
      
      {/* Top Header Bar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-8 flex items-center justify-between relative z-50">
        <Logo forceDark size={36} className="hover:opacity-80 transition-opacity cursor-pointer" />
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-bold tracking-wide mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" /> The Premium JEE & NEET Workspace
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.05] max-w-5xl" 
          >
            Peak Performance <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 inline-block pb-2">
              Exam Prep.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mt-6 font-medium" 
          >
            Step into the most advanced preparation headquarters. Not just another test series—a complete, intelligent ecosystem built to engineer top ranks.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center" 
          >
            <Link
              href="/sign-up"
              prefetch
              className="px-10 py-4 bg-white text-black font-bold text-base rounded-full hover:bg-slate-100 transition-all duration-300 hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 group w-full sm:w-auto"
            >
              Start Your Journey <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <DashboardPreview />
        </div>
      </main>

      {/* Preparation Journey Section */}
      <section className="py-24 relative z-10 border-t border-slate-800/50 bg-[#020617]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Your Preparation Journey</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">A scientifically proven workflow designed to maximize retention and minimize mistakes.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 flex-wrap">
            <JourneyStep icon={BookOpen} title="Learn" desc="Master concepts with the Formula Handbook" delay={0.1} />
            <JourneyStep icon={Target} title="Practice" desc="Solve chapter-wise PYQs rigorously" delay={0.2} />
            <JourneyStep icon={TestTube2} title="Test" desc="Simulate real exams with Full Mocks" delay={0.3} />
            <JourneyStep icon={LineChart} title="Analyze" desc="Deep dive into performance metrics" delay={0.4} />
            <JourneyStep icon={Brain} title="Improve" desc="Target and eliminate weak chapters" delay={0.5} />
            <JourneyStep icon={Users} title="Discuss" desc="Learn alongside the top community" delay={0.6} isLast />
          </div>
        </div>
      </section>

      {/* The Four Pillars Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Everything You Need. <br className="sm:hidden"/> Nothing You Don&apos;t.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Four pillars of preparation, meticulously designed for clarity and focus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PillarCard 
              icon={Target} 
              title="Practice" 
              items={["Extensive PYQ Library", "Full-length Mock Tests", "Chapter-wise Drills", "Custom Test Creation"]}
              colorClass="bg-indigo-500/20 border border-indigo-500/30"
              gradientClass="bg-gradient-to-r from-indigo-500 to-indigo-400"
              delay={0.1}
            />
            <PillarCard 
              icon={History} 
              title="Revise" 
              items={["Digital Formula Handbook", "Saved Important Questions", "Mistake Revision Engine", "Quick Concept Recap"]}
              colorClass="bg-purple-500/20 border border-purple-500/30"
              gradientClass="bg-gradient-to-r from-purple-500 to-purple-400"
              delay={0.2}
            />
            <PillarCard 
              icon={BarChart} 
              title="Improve" 
              items={["Granular Analytics", "Detailed Solution Review", "Weak Chapter Detection", "Time Management Insights"]}
              colorClass="bg-emerald-500/20 border border-emerald-500/30"
              gradientClass="bg-gradient-to-r from-emerald-500 to-emerald-400"
              delay={0.3}
            />
            <PillarCard 
              icon={Globe} 
              title="Connect" 
              items={["Active Study Community", "Peer Discussions", "Doubt Resolution", "Global Leaderboards"]}
              colorClass="bg-rose-500/20 border border-rose-500/30"
              gradientClass="bg-gradient-to-r from-rose-500 to-rose-400"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Premium Trust Section */}
      <section className="py-24 relative z-10 border-t border-slate-800/50 bg-[#020617]/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">Engineered for Excellence.</h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">PrepZii is built on the foundation of real exam patterns and proven cognitive science. We don&apos;t use gimmicks—just pure, focused preparation tools that deliver results.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TrustCard title="Verified PYQs" desc="100% authentic previous year questions with detailed solutions." delay={0.1} />
                <TrustCard title="Real Exam UI" desc="Practice in an environment that matches the actual exam screen." delay={0.2} />
                <TrustCard title="Zero Clutter" desc="A distraction-free interface optimized for deep work." delay={0.3} />
                <TrustCard title="Smart Gamification" desc="Streaks and XP designed to build sustainable study habits." delay={0.4} />
              </div>
            </div>
            
            <div className="relative h-[400px] sm:h-[600px] w-full flex items-center justify-center">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1 }}
                 className="relative w-full max-w-md aspect-square flex items-center justify-center"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-[100px]" />
                 <div className="relative aspect-square w-[min(300px,78vw)] sm:w-[400px] border border-slate-800 rounded-full flex items-center justify-center">
                    <div className="h-[80%] w-[80%] border border-slate-700/50 rounded-full flex items-center justify-center">
                      <div className="h-[60%] w-[60%] border border-slate-600/50 rounded-full flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-md shadow-2xl">
                        <ShieldCheck className="w-16 h-16 text-emerald-400" />
                      </div>
                    </div>
                 </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative z-10">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/20 pointer-events-none" />
         <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
           >
             <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">Ready to secure your rank?</h2>
             <p className="text-xl text-slate-400 mb-12">Join the elite workspace and transform your preparation today.</p>
             <Link
                 href="/sign-up"
                 prefetch
                 className="px-12 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-slate-100 transition-all duration-300 hover:scale-[1.03] shadow-[0_0_40px_rgba(255,255,255,0.2)]"
               >
                 Enter Workspace
               </Link>
           </motion.div>
         </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-sm font-medium text-slate-500 relative z-10 border-t border-slate-800/50">
        © {new Date().getFullYear()} PrepZii Systems. Built for top national ranks.
      </footer>
    </div>
  );
}
