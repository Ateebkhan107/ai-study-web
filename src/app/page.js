"use client";

// NOTE: 'use client' is retained for Framer Motion entrance animations only.
// All CTA navigation uses <Link> so crawlers and prefetching work correctly.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { motion, MotionConfig } from "framer-motion";
import Logo from "@/components/Logo";
import { GraphVisual } from "@/components/ui/educational-visuals";
import {
  Target,
  BookOpen,
  CheckCircle2,
  TestTube2,
  LineChart,
  Brain,
  History,
  ShieldCheck,
  ChevronRight,
  BarChart,
  Globe,
  ArrowRight,
  FileText,
  Clock,
  Zap,
  FlaskConical,
  Dna,
  Calculator,
  MessageSquare,
} from "lucide-react";

/* ── Fonts ─────────────────────────────────────────────────── */
const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-prepzii-landing-display",
  display: "swap",
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-prepzii-landing-body",
  display: "swap",
});

// Shorthand class references
const D = "font-[family-name:var(--font-prepzii-landing-display)]";
const B = "font-[family-name:var(--font-prepzii-landing-body)]";

/* ── Shared animation variants ──────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

/* ── WorkflowStep ───────────────────────────────────────────── */
function WorkflowStep({ number, icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      custom={delay}
      variants={fadeUp}
      className="flex flex-col items-center text-center flex-1 min-w-[110px] max-w-[160px] mx-auto sm:mx-0 group"
    >
      <div className="w-11 h-11 rounded-full bg-yellow-50 border-2 border-brand flex items-center justify-center mb-3 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-sm">
        <span className={`${D} text-sm font-semibold text-brand leading-none`}>
          {number}
        </span>
      </div>
      <Icon className="w-5 h-5 text-blue-500 mb-2.5 transition-colors duration-300 group-hover:text-blue-600" />
      <h4 className={`${D} text-sm font-semibold text-[#121826] mb-1 leading-snug`}>
        {title}
      </h4>
      <p className={`${B} text-xs text-[#64748B] leading-5`}>{desc}</p>
    </motion.div>
  );
}

/* ── WorkflowConnector ──────────────────────────────────────── */
function WorkflowConnector({ delay = 0 }) {
  return (
    <div className="hidden lg:flex items-center shrink-0 mx-1">
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: 24, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        className="h-px bg-gray-300"
      />
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
      >
        <ChevronRight className="w-4 h-4 text-gray-300 -ml-1.5" />
      </motion.div>
    </div>
  );
}

/* ── PillarCard ─────────────────────────────────────────────── */
function PillarCard({ icon: Icon, title, items, iconBgClass, iconColorClass, delay }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      custom={delay}
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 border ${iconBgClass}`}
      >
        <Icon className={`w-5 h-5 ${iconColorClass}`} />
      </div>
      <h3 className={`${D} text-lg font-semibold text-[#121826] mb-4`}>{title}</h3>
      <ul className="space-y-2.5 flex-1">
        {items.map((item, i) => (
          <li
            key={i}
            className={`${B} flex items-start gap-2.5 text-sm text-[#334155]`}
          >
            <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── TrustItem ──────────────────────────────────────────────── */
function TrustItem({ icon: Icon = CheckCircle2, title, desc, delay, isZi = false }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={delay}
      variants={fadeUp}
      className="flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-yellow-50 border border-brand/25 flex items-center justify-center shrink-0 mt-0.5">
        {isZi ? (
          <div className="flex gap-0.5">
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1 h-1 bg-brand rounded-full" />
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} className="w-1 h-1 bg-brand rounded-full" />
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} className="w-1 h-1 bg-brand rounded-full" />
          </div>
        ) : (
          <Icon className="w-4 h-4 text-brand" />
        )}
      </div>
      <div>
        <h4 className={`${D} text-base font-semibold text-[#121826] mb-0.5 leading-snug`}>
          {title}
        </h4>
        <p className={`${B} text-sm text-[#64748B] leading-5`}>{desc}</p>
      </div>
    </motion.div>
  );
}

/* ── StatItem ───────────────────────────────────────────────── */
function StatItem({ value, label, delay }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={delay}
      variants={fadeUp}
      className="text-center"
    >
      <div className={`${D} text-3xl md:text-4xl font-semibold text-[#121826] mb-1`}>
        {value}
      </div>
      <div className={`${B} text-sm text-[#64748B]`}>{label}</div>
    </motion.div>
  );
}

/* ── ProductPreview — mock PYQ question card ────────────────── */
function ProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Exam header bar */}
      <div className="bg-[#1E2A44] px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className={`${B} text-white text-sm font-medium truncate`}>
            JEE Advanced 2023 · Physics
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`${B} text-gray-400 text-xs flex items-center gap-1`}>
            <Clock className="w-3 h-3" />
            2:45
          </span>
          <span className="bg-yellow-400/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full font-medium">
            Q 12 / 30
          </span>
        </div>
      </div>

      {/* Question body */}
      <div className="p-5">
        <p className={`${B} text-sm text-[#121826] leading-6 mb-5`}>
          A particle of mass <strong>m</strong> moves in a circular orbit of radius{" "}
          <strong>r</strong> in a central force potential{" "}
          <code className="text-xs bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-mono">
            V(r) = k·r²
          </code>
          . The time period of the orbit is proportional to:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "A", text: "r⁰", selected: false, correct: false },
            { label: "B", text: "r¹", selected: true, correct: true },
            { label: "C", text: "r²", selected: false, correct: false },
            { label: "D", text: "r³/²", selected: false, correct: false },
          ].map((opt, i) => (
            <motion.div
              key={opt.label}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
              className={`flex items-center gap-2.5 border rounded-lg px-3 py-2 text-sm cursor-default select-none
                ${
                  opt.correct
                    ? "border-green-300 bg-green-50 text-green-800"
                    : "border-gray-200 bg-white text-[#334155]"
                }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0
                  ${opt.correct ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                {opt.label}
              </span>
              <span className={`${B} text-sm`}>{opt.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-4">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              className={`${B} text-xs text-[#64748B]`}
            >
              <span className="font-semibold text-[#334155]">68%</span> accuracy
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className={`${B} text-xs text-[#64748B]`}
            >
              <span className="font-semibold text-[#334155]">2.4k</span> attempts
            </motion.span>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.3 }}
            className={`${B} text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium`}
          >
            Medium
          </motion.span>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className={`${B} text-xs text-[#64748B]`}>Progress</span>
          <span className={`${B} text-xs text-[#64748B]`}>12 / 30 questions</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "40%" }}
            transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
            className="h-full bg-brand rounded-full" 
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function PublicLandingPage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStartClick = (e) => {
    e.preventDefault();
    setIsTransitioning(true);
    router.prefetch("/sign-up");
    setTimeout(() => {
      router.push("/sign-up");
      setTimeout(() => setIsTransitioning(false), 2000);
    }, 1500);
  };

  return (
    <MotionConfig reducedMotion="user">
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] bg-[#09090B] flex flex-col items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center relative"
          >
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-brand/15 blur-3xl rounded-full pointer-events-none" />
            
            {/* Logo */}
            <div className="relative z-10 mb-8">
              <Logo forceDark size={48} />
            </div>
            
            {/* Loader dots */}
            <div className="flex gap-1.5 mb-6">
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 bg-brand rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-brand rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-brand rounded-full"
              />
            </div>
            
            <p className={`${B} text-white/60 text-sm font-medium tracking-wide animate-pulse`}>
              Preparing your experience...
            </p>
          </motion.div>
        </motion.div>
      )}
      <div
        className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-white text-[#334155] ${B} selection:bg-yellow-100`}
      >
      {/* ════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Logo forceLight size={44} />

          {/* Nav links — desktop only */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/jee"
              className={`${B} text-sm text-[#334155] hover:text-[#121826] font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              JEE
            </Link>
            <Link
              href="/neet"
              className={`${B} text-sm text-[#334155] hover:text-[#121826] font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              NEET
            </Link>
            <Link
              href="/pricing"
              className={`${B} text-sm text-[#334155] hover:text-[#121826] font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              Pricing
            </Link>
          </nav>

          {/* Auth CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className={`${B} hidden sm:inline-flex text-sm text-[#334155] hover:text-[#121826] font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              onClick={handleStartClick}
              prefetch
              className={`${B} text-sm font-semibold bg-brand hover:bg-brand-hover text-black px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5`}
            >
              Get Started
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFFDF2] border-b border-[#F1E7BE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-24">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 gap-12">
            {/* Left: Copy */}
            <div className="flex-1 max-w-2xl">
              {/* Eyebrow badge */}
              <motion.div
                initial="hidden"
                animate="visible"
                custom={0}
                variants={fadeUp}
                className={`${B} inline-flex items-center gap-2 mb-6 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                JEE &amp; NEET Preparation Platform
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className={`${D} text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-[#121826] leading-[1.1] mb-6 flex flex-wrap gap-x-3 gap-y-1`}
              >
                <motion.span variants={fadeUp}>The</motion.span>
                <motion.span variants={fadeUp}>structured</motion.span>
                <motion.span variants={fadeUp}>way</motion.span>
                <motion.span variants={fadeUp}>to</motion.span>
                <motion.span variants={fadeUp}>crack</motion.span>
                <motion.span variants={fadeUp} className="text-brand relative whitespace-nowrap">
                  JEE &amp; NEET
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
                    className="absolute -bottom-1 left-0 h-1 bg-brand/40 rounded-full"
                  />
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial="hidden"
                animate="visible"
                custom={0.4}
                variants={fadeUp}
                className={`${B} text-lg text-[#334155] leading-8 mb-8 max-w-xl`}
              >
                Practice from verified PYQs, take full-length mock tests, revise
                formula books, detect weak chapters, and track your performance —
                all in one focused workspace.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial="hidden"
                animate="visible"
                custom={0.3}
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <Link
                  href="/sign-up"
                  onClick={handleStartClick}
                  prefetch
                  className={`${B} inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand hover:bg-brand-hover text-black font-semibold text-base rounded-xl transition-all duration-200 hover:shadow-md group`}
                >
                  Start Preparing Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                initial="hidden"
                animate="visible"
                custom={0.4}
                variants={fadeUp}
                className={`${B} flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#64748B]`}
              >
                {[
                  "Free to start",
                  "Verified PYQs",
                  "Real exam interface",
                  "No clutter",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Product preview */}
            <div className="flex-1 w-full lg:max-w-[500px]">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STATS BAND
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 md:gap-8 divide-x-0 md:divide-x divide-gray-100">
            <StatItem value="10,000+" label="PYQs from 2017–2026" delay={0.05} />
            <StatItem value="50+" label="Full-length mock tests" delay={0.1} />
            <StatItem value="4 Subjects" label="Physics, Chemistry, Bio, Maths" delay={0.15} />
            <StatItem value="100%" label="Authentic exam questions" delay={0.2} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PREPARATION WORKFLOW
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFFDF2] py-12 md:py-12 md:py-20 border-b border-[#F1E7BE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className={`${B} text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3`}
            >
              How PrepZii works
            </motion.p>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.1}
              variants={fadeUp}
              className={`${D} text-3xl md:text-4xl font-semibold text-[#121826] mb-4`}
            >
              Your complete preparation workflow
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.2}
              variants={fadeUp}
              className={`${B} text-base text-[#64748B] max-w-xl mx-auto leading-7`}
            >
              Move from concept review to PYQ practice, full mock tests, deep
              analysis, and targeted improvement — without switching tools.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap lg:flex-nowrap items-start justify-center gap-y-10 gap-x-4 sm:gap-8 lg:gap-0">
            <WorkflowStep
              number="1"
              icon={BookOpen}
              title="Learn"
              desc="Review formulas and concepts with digital handbooks"
              delay={0.05}
            />
            <WorkflowConnector delay={0.15} />
            <WorkflowStep
              number="2"
              icon={Target}
              title="Practice"
              desc="Solve chapter-wise PYQs from JEE & NEET past papers"
              delay={0.2}
            />
            <WorkflowConnector delay={0.3} />
            <WorkflowStep
              number="3"
              icon={TestTube2}
              title="Test"
              desc="Take full-length timed mocks under real exam conditions"
              delay={0.35}
            />
            <WorkflowConnector delay={0.45} />
            <WorkflowStep
              number="4"
              icon={LineChart}
              title="Analyze"
              desc="Review accuracy, speed, and performance metrics"
              delay={0.5}
            />
            <WorkflowConnector delay={0.6} />
            <WorkflowStep
              number="5"
              icon={Brain}
              title="Improve"
              desc="Target the weak chapters your analytics surface"
              delay={0.65}
            />
            <WorkflowConnector delay={0.75} />
            <WorkflowStep
              number="6"
              icon={MessageSquare}
              title="Discuss"
              desc="Resolve doubts with AI or peer study groups"
              delay={0.8}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOUR PILLARS
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white py-12 md:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className={`${D} text-3xl md:text-4xl font-semibold text-[#121826] mb-4`}
            >
              Everything you need to prepare
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.1}
              variants={fadeUp}
              className={`${B} text-base text-[#64748B] max-w-xl mx-auto leading-7`}
            >
              Four focused tools. One distraction-free workspace.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <PillarCard
              icon={Target}
              title="Practice"
              items={[
                "Extensive PYQ library",
                "Full-length mock tests",
                "Chapter-wise drills",
                "Custom test creation",
              ]}
              iconBgClass="bg-amber-50 border-amber-200"
              iconColorClass="text-amber-600"
              delay={0.05}
            />
            <PillarCard
              icon={History}
              title="Revise"
              items={[
                "Digital formula handbook",
                "Saved important questions",
                "Mistake revision engine",
                "Quick concept recap",
              ]}
              iconBgClass="bg-blue-50 border-blue-100"
              iconColorClass="text-blue-600"
              delay={0.1}
            />
            <PillarCard
              icon={BarChart}
              title="Analyze"
              items={[
                "Granular performance analytics",
                "Weak chapter detection",
                "Time management insights",
                "Detailed solution review",
              ]}
              iconBgClass="bg-emerald-50 border-emerald-100"
              iconColorClass="text-emerald-600"
              delay={0.15}
            />
            <PillarCard
              icon={Globe}
              title="Connect"
              items={[
                "Active study community",
                "Peer discussions",
                "Doubt resolution",
                "Global leaderboards",
              ]}
              iconBgClass="bg-rose-50 border-rose-100"
              iconColorClass="text-rose-500"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST / AUTHENTICITY
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFFDF2] py-12 md:py-20 border-b border-[#F1E7BE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            {/* Left: copy */}
            <div>
              <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                variants={fadeUp}
                className={`${B} text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4`}
              >
                Why PrepZii
              </motion.p>
              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0.1}
                variants={fadeUp}
                className={`${D} text-3xl md:text-4xl font-semibold text-[#121826] mb-5 leading-tight`}
              >
                Built around{" "}
                <span className="text-brand">real exam work,</span>
                {" "}with AI that helps
              </motion.h2>
              <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0.2}
                variants={fadeUp}
                className={`${B} text-base text-[#334155] mb-10 leading-7`}
              >
                PrepZii starts with verified previous year papers and focused exam
                workflows. Zi helps you understand, revise, plan, and improve
                without getting in the way of your preparation.
              </motion.p>

              <div className="space-y-5">
                <TrustItem
                  title="Verified PYQs"
                  desc="100% authentic questions from 2017–2026 with detailed step-by-step solutions."
                  delay={0.1}
                />
                <TrustItem
                  title="Real exam UI"
                  desc="Practice in an environment that closely mirrors the actual CBT interface."
                  delay={0.15}
                />
                <TrustItem
                  title="Zi — your study companion"
                  desc="Ask Zi to explain any question, suggest what to revise next, or help you understand a concept you're stuck on."
                  delay={0.2}
                  isZi={true}
                />
                <TrustItem
                  title="Habits that stick"
                  desc="Streaks, XP, and personalised revision plans built around your weak chapters and exam schedule."
                  delay={0.25}
                />
              </div>
            </div>

            {/* Right: analytics illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <div className="relative w-full max-w-sm aspect-square">
                {/* Decorative rings */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#E8DDAF] opacity-50" />
                <div className="absolute inset-8 rounded-full border border-[#E8DDAF] opacity-40" />

                {/* Central graph visual */}
                <div className="absolute inset-16 flex items-center justify-center">
                  <GraphVisual className="w-full h-full text-blue-500 opacity-75" />
                </div>

                {/* Stat pill — top right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                  className="absolute top-3 right-3 bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 shadow-sm text-left"
                >
                  <div className={`${B} text-[10px] text-[#64748B] mb-0.5`}>Accuracy</div>
                  <div className={`${D} text-xl font-semibold text-[#121826]`}>88%</div>
                </motion.div>

                {/* Stat pill — bottom left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                  className="absolute bottom-5 left-2 bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 shadow-sm text-left"
                >
                  <div className={`${B} text-[10px] text-[#64748B] mb-0.5`}>Weak chapter</div>
                  <div className={`${D} text-sm font-semibold text-[#121826]`}>Thermodynamics</div>
                  <div className="w-20 bg-gray-100 rounded-full h-1 mt-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "30%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-red-400 rounded-full"
                    />
                  </div>
                </motion.div>

                {/* Streak pill — bottom right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                  className="absolute bottom-3 right-3 bg-brand rounded-xl px-3.5 py-2.5 shadow-sm text-left"
                >
                  <div className={`${B} text-[10px] text-black/60 mb-0.5`}>Streak</div>
                  <div className={`${D} text-lg font-semibold text-black`}>14 days 🔥</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SUBJECTS
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white py-12 md:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className={`${D} text-3xl md:text-4xl font-semibold text-[#121826] mb-4`}
            >
              Every subject. Every chapter.
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.1}
              variants={fadeUp}
              className={`${B} text-base text-[#64748B] max-w-xl mx-auto leading-7`}
            >
              Full PYQ and mock test coverage across all JEE and NEET subjects.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                subject: "Physics",
                icon: Zap,
                desc: "Mechanics · Optics · Electricity · Modern Physics",
                bgClass: "bg-blue-50 border-blue-100",
                textClass: "text-blue-700",
                iconClass: "text-blue-500",
              },
              {
                subject: "Chemistry",
                icon: FlaskConical,
                desc: "Organic · Inorganic · Physical · Coordination",
                bgClass: "bg-emerald-50 border-emerald-100",
                textClass: "text-emerald-700",
                iconClass: "text-emerald-600",
              },
              {
                subject: "Biology",
                icon: Dna,
                desc: "Botany · Zoology · Human Physiology · Genetics",
                bgClass: "bg-rose-50 border-rose-100",
                textClass: "text-rose-700",
                iconClass: "text-rose-500",
              },
              {
                subject: "Mathematics",
                icon: Calculator,
                desc: "Calculus · Algebra · Coordinate Geometry · Probability",
                bgClass: "bg-amber-50 border-amber-100",
                textClass: "text-amber-700",
                iconClass: "text-amber-600",
              },
            ].map((s, i) => (
              <motion.div
                key={s.subject}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.07}
                variants={fadeUp}
                className={`border rounded-2xl p-4 sm:p-5 ${s.bgClass}`}
              >
                <div className="mb-3">
                  <s.icon className={`w-6 h-6 ${s.iconClass}`} />
                </div>
                <h3 className={`${D} text-base font-semibold mb-1.5 ${s.textClass}`}>
                  {s.subject}
                </h3>
                <p className={`${B} text-xs text-[#64748B] leading-5`}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#121826] py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2
              className={`${D} text-3xl md:text-5xl font-semibold text-white mb-5 leading-tight`}
            >
              Ready for a clearer{" "}
              <span className="text-brand">study routine?</span>
            </h2>
            <p
              className={`${B} text-base text-gray-400 mb-10 leading-7 max-w-xl mx-auto`}
            >
              Start with a workspace built for PYQs, mock tests, formula
              revision, and steady performance improvement. Free to begin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/sign-up"
                onClick={handleStartClick}
                prefetch
                className={`${B} inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-black font-semibold text-base rounded-xl transition-all duration-200 hover:shadow-lg group`}
              >
                Start Preparing Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer className="bg-[#0F1720] py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <Logo forceDark size={36} />
            <span>© {new Date().getFullYear()} PrepZii Systems</span>
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/jee" className="hover:text-gray-300 transition-colors">
              JEE
            </Link>
            <Link href="/neet" className="hover:text-gray-300 transition-colors">
              NEET
            </Link>
            <Link href="/pricing" className="hover:text-gray-300 transition-colors">
              Pricing
            </Link>
          </nav>
          <p className="text-gray-600 text-xs">Built for top national ranks.</p>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
