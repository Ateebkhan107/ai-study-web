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
        className="absolute top-[10%] left-[-10%] h-[min(800px,120vw)] w-[min(800px,120vw)] rounded-full border border-brand/10 border-dashed"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[-10%] h-[min(600px,100vw)] w-[min(600px,100vw)] rounded-full border border-brand/10 border-dotted"
      />
      {SCIENCE_PARTICLES.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute bg-brand/20 rounded-full"
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[700px] bg-[var(--background)]/80 backdrop-blur-2xl border border-brand/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand/20"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center border border-brand/30">
              <Target className="w-6 h-6 text-brand-hover" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-bold">Today&apos;s Goal</h3>
              <p className="text-sm text-muted">Master Rotational Mechanics</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-3xl font-bold text-foreground">42<span className="text-sm text-muted ml-1">/50 PYQs</span></span>
          </div>
        </div>
        
        <div className="w-full bg-surface-elevated/60 rounded-full h-3 overflow-hidden mb-8 border border-border-subtle/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "84%" }}
            transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
            className="h-full bg-brand rounded-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
           <div className="bg-surface-elevated/40 rounded-2xl p-5 border border-border-subtle/50 hover:border-brand/30 transition-colors">
             <div className="flex items-center gap-3 mb-3">
               <Activity className="w-5 h-5 text-brand-hover" />
               <span className="text-sm font-medium text-secondary">Physics Accuracy</span>
             </div>
             <span className="text-2xl font-bold text-foreground">88%</span>
           </div>
           <div className="bg-surface-elevated/40 rounded-2xl p-5 border border-border-subtle/50 hover:border-brand/30 transition-colors">
             <div className="flex items-center gap-3 mb-3">
               <Trophy className="w-5 h-5 text-brand-hover" />
               <span className="text-sm font-medium text-secondary">Total XP</span>
             </div>
             <span className="text-2xl font-bold text-foreground">12,450</span>
           </div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-[2%] sm:left-[5%] w-[180px] bg-[var(--surface)]/95 backdrop-blur-xl border border-brand/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(194,114,63,0.15)] z-30 hidden sm:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-brand-hover" />
          <span className="text-sm font-medium text-secondary">Current Streak</span>
        </div>
        <span className="text-2xl font-bold text-foreground">14 <span className="text-sm text-muted font-normal">Days</span></span>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-[2%] sm:right-[5%] w-[220px] bg-[var(--surface)]/95 backdrop-blur-xl border border-brand/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] z-30"
      >
        <div className="flex items-center gap-2 mb-3">
          <TestTube2 className="w-4 h-4 text-brand-hover" />
          <span className="text-sm font-medium text-secondary">Next Mock Test</span>
        </div>
        <div className="bg-brand/10 border border-brand/20 px-3 py-2 rounded-lg inline-block">
          <span className="text-sm font-semibold text-foreground">JEE Advanced Full</span>
        </div>
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-24 right-[1%] sm:right-[2%] w-[180px] bg-[var(--surface)]/95 backdrop-blur-xl border border-brand/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(194,114,63,0.15)] z-10 hidden md:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-brand-hover" />
          <span className="text-xs font-medium text-secondary">Formula Book</span>
        </div>
        <span className="text-lg font-bold text-foreground block">+24 Revised</span>
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-20 left-[1%] sm:left-[2%] w-[200px] bg-[var(--surface)]/95 backdrop-blur-xl border border-brand/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(244,63,94,0.15)] z-10 hidden md:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-brand-hover" />
          <span className="text-xs font-medium text-secondary">Weak Chapter</span>
        </div>
        <span className="text-sm font-bold text-foreground block truncate">Thermodynamics</span>
        <div className="w-full bg-surface-elevated rounded-full h-1 mt-2">
          <div className="w-[30%] h-full bg-brand-hover rounded-full"></div>
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
        className="w-20 h-20 rounded-2xl bg-[var(--surface)]/80 backdrop-blur-md border border-brand/20 flex items-center justify-center mb-5 relative z-10 group-hover:border-brand/60 group-hover:shadow-[0_0_20px_rgba(194,114,63,0.2)] transition-all duration-300"
      >
        <Icon className="w-8 h-8 text-brand-hover group-hover:scale-110 transition-transform duration-300" />
      </motion.div>
      <motion.h4 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.2 }}
        className="text-foreground font-bold mb-2"
      >
        {title}
      </motion.h4>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3 }}
        className="text-xs text-muted leading-relaxed"
      >
        {desc}
      </motion.p>
      {!isLast && (
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          whileInView={{ opacity: 1, width: "100%" }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.4, duration: 0.5 }}
          className="hidden lg:block absolute top-10 left-[70%] w-full h-[2px] bg-gradient-to-r from-brand/40 to-transparent z-0 origin-left"
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
      className="bg-[var(--surface)]/60 backdrop-blur-xl border border-border-subtle/80 p-8 rounded-[32px] hover:border-border-subtle transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${colorClass} transition-transform group-hover:scale-110 duration-300`}>
        <Icon className="w-7 h-7 text-foreground" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-6 tracking-tight">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-secondary text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-brand-hover shrink-0" />
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
      className="flex items-start gap-4 p-6 rounded-2xl bg-[var(--surface)]/40 border border-brand/10 hover:bg-[var(--surface)]/60 hover:border-brand/20 transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0 border border-brand/20">
        <CheckCircle2 className="w-5 h-5 text-brand-hover" />
      </div>
      <div>
        <h4 className="text-foreground font-bold text-lg mb-1">{title}</h4>
        <p className="text-muted text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function PublicLandingPage() {
  return (
    <div className="dark min-h-screen bg-[var(--background)] text-secondary overflow-hidden font-sans selection:bg-brand/30 relative">
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/30 bg-brand/10 text-foreground text-xs sm:text-sm font-bold tracking-wide mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-brand-hover" /> The Premium JEE & NEET Workspace
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.05] max-w-5xl" 
          >
            Peak Performance <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-hover inline-block pb-2">
              Exam Prep.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed mt-6 font-medium" 
          >
            PrepZii brings JEE & NEET PYQs, previous year questions, full-length mock tests, formula revision, performance analytics, and focused practice into one preparation workspace.
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
              className="px-10 py-4 bg-brand text-black font-bold text-base rounded-full hover:bg-brand-hover transition-all duration-300 hover:scale-[1.02] shadow-[0_0_30px_rgba(234,179,8,0.25)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2 group w-full sm:w-auto"
            >
              Start Your Journey <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/jee"
              className="px-6 py-4 border border-brand/30 bg-[var(--surface)]/60 text-foreground font-bold text-base rounded-full hover:border-brand/60 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
            >
              JEE preparation
            </Link>
            <Link
              href="/neet"
              className="px-6 py-4 border border-brand/30 bg-[var(--surface)]/60 text-foreground font-bold text-base rounded-full hover:border-brand/60 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
            >
              NEET preparation
            </Link>
          </motion.div>

          <DashboardPreview />
        </div>
      </main>

      {/* Preparation Journey Section */}
      <section className="py-24 relative z-10 border-t border-border-subtle/50 bg-[var(--background)]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">Your Preparation Journey</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">A scientifically proven workflow designed to maximize retention and minimize mistakes.</p>
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
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">Everything You Need. <br className="sm:hidden"/> Nothing You Don&apos;t.</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">Four pillars of preparation, meticulously designed for clarity and focus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PillarCard 
              icon={Target} 
              title="Practice" 
              items={["Extensive PYQ Library", "Full-length Mock Tests", "Chapter-wise Drills", "Custom Test Creation"]}
              colorClass="bg-brand/20 border border-brand/30"
              gradientClass="bg-gradient-to-r from-brand to-brand-hover"
              delay={0.1}
            />
            <PillarCard 
              icon={History} 
              title="Revise" 
              items={["Digital Formula Handbook", "Saved Important Questions", "Mistake Revision Engine", "Quick Concept Recap"]}
              colorClass="bg-brand/20 border border-brand/30"
              gradientClass="bg-brand"
              delay={0.2}
            />
            <PillarCard 
              icon={BarChart} 
              title="Improve" 
              items={["Granular Analytics", "Detailed Solution Review", "Weak Chapter Detection", "Time Management Insights"]}
              colorClass="bg-brand/20 border border-brand/30"
              gradientClass="bg-gradient-to-r from-brand to-brand-hover"
              delay={0.3}
            />
            <PillarCard 
              icon={Globe} 
              title="Connect" 
              items={["Active Study Community", "Peer Discussions", "Doubt Resolution", "Global Leaderboards"]}
              colorClass="bg-brand/20 border border-brand/30"
              gradientClass="bg-gradient-to-r from-brand to-brand-hover"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Premium Trust Section */}
      <section className="py-24 relative z-10 border-t border-border-subtle/50 bg-[var(--background)]/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-6">Engineered for Excellence.</h2>
              <p className="text-muted text-lg mb-10 leading-relaxed">PrepZii is built on the foundation of real exam patterns and proven cognitive science. We don&apos;t use gimmicks—just pure, focused preparation tools that deliver results.</p>
              
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
                 <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 to-brand-hover/10 rounded-full blur-[100px]" />
                 <div className="relative aspect-square w-[min(300px,78vw)] sm:w-[400px] border border-border-subtle rounded-full flex items-center justify-center">
                    <div className="h-[80%] w-[80%] border border-border-subtle/50 rounded-full flex items-center justify-center">
                      <div className="h-[60%] w-[60%] border border-border-subtle/50 rounded-full flex items-center justify-center bg-[var(--surface)]/80 backdrop-blur-md shadow-2xl">
                        <ShieldCheck className="w-16 h-16 text-brand-hover" />
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
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-border/20 pointer-events-none" />
         <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
           >
             <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-8">Ready to secure your rank?</h2>
             <p className="text-xl text-muted mb-12">Join the elite workspace and transform your preparation today.</p>
             <Link
                 href="/sign-up"
                 prefetch
                 className="px-12 py-5 bg-brand text-black font-bold text-lg rounded-full hover:bg-brand-hover transition-all duration-300 hover:scale-[1.03] shadow-[0_0_40px_rgba(234,179,8,0.3)]"
               >
                 Enter Workspace
               </Link>
           </motion.div>
         </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-sm font-medium text-disabled relative z-10 border-t border-border-subtle/50">
        © {new Date().getFullYear()} PrepZii Systems. Built for top national ranks.
      </footer>
    </div>
  );
}
