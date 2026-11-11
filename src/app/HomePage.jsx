import Link from "next/link";
import fontStyles from "./fonts/landing.module.css";
import fontPreloads from "./fonts/preloads.json";
import LandingAuthLinks from "./LandingAuthLinks";
import styles from "./landing.module.css";
import Logo from "@/components/Logo";
import PublicExamNavigation from "@/components/seo/PublicExamNavigation";
import { GraphVisual } from "@/components/ui/educational-visuals";
import {
  Target,
  BookOpen,
  CheckCircle2,
  TestTube2,
  LineChart,
  Brain,
  History,
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
const displayFont = { variable: fontStyles.display };
const bodyFont = { variable: fontStyles.body };

const D = "font-[family-name:var(--font-space-grotesk)]";
const B = "font-[family-name:var(--font-prepzii-landing-body)]";

/* ── WorkflowStep ───────────────────────────────────────────── */
function WorkflowStep({ number, icon: Icon, title, desc }) {
  return (
    <div
      className={`${styles.reveal} motion-safe:hover:-translate-y-1 motion-safe:transition relative flex flex-col border-[3px] border-[#111111] bg-white p-3 text-left shadow-[4px_4px_0_#111111] transition-shadow duration-200 hover:shadow-[6px_6px_0_#F4B400] sm:min-h-[210px] sm:p-4 sm:shadow-[7px_7px_0_#111111] sm:hover:shadow-[10px_10px_0_#F4B400]`}
    >
      <div className="mb-3 flex items-start justify-between gap-2 sm:mb-5 sm:gap-3">
        <span className={`${D} flex h-8 w-8 items-center justify-center border-[3px] border-[#111111] bg-[#F4B400] text-sm font-black leading-none text-black shadow-[3px_3px_0_#111111] sm:h-11 sm:w-11 sm:text-lg sm:shadow-[4px_4px_0_#111111]`}>
          {number}
        </span>
        <Icon className="h-5 w-5 text-[#111111] sm:h-7 sm:w-7" strokeWidth={2.6} />
      </div>
      <h4 className={`${D} mb-1 text-base font-black uppercase tracking-normal text-[#111111] sm:mb-2 sm:text-xl`}>
        {title}
      </h4>
      <p className={`${B} text-[12px] font-semibold leading-5 text-[#334155] sm:text-sm sm:leading-6`}>{desc}</p>
    </div>
  );
}

/* ── WorkflowConnector ──────────────────────────────────────── */
function WorkflowConnector() {
  return (
    <div className="hidden lg:flex items-center shrink-0 px-1 pt-24">
      <div
        className={`w-7 h-[3px] bg-[#111111]`}
      />
      <div
      >
        <ChevronRight className="-ml-1.5 h-5 w-5 text-[#111111]" strokeWidth={3} />
      </div>
    </div>
  );
}

/* ── PillarCard ─────────────────────────────────────────────── */
function PillarCard({ icon: Icon, title, items, accentClass, label }) {
  return (
    <div
      className={`${styles.reveal} motion-safe:hover:-translate-y-1 motion-safe:transition group flex flex-col border-[3px] border-[#111111] bg-white p-3 shadow-[4px_4px_0_#111111] transition-shadow duration-200 hover:shadow-[6px_6px_0_#F4B400] sm:min-h-[360px] sm:p-5 sm:shadow-[8px_8px_0_#111111] sm:hover:shadow-[11px_11px_0_#F4B400]`}
    >
      <div className="mb-4 flex items-start justify-between gap-2 sm:mb-6 sm:gap-4">
        <span className={`${B} border-2 border-[#111111] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#111111] sm:px-2 sm:py-1 sm:text-[11px] ${accentClass}`}>
          {label}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center border-[3px] border-[#111111] ${accentClass} shadow-[3px_3px_0_#111111] transition-transform duration-200 group-hover:-rotate-3 sm:h-14 sm:w-14 sm:shadow-[4px_4px_0_#111111]`}>
          <Icon className="h-5 w-5 text-[#111111] sm:h-7 sm:w-7" strokeWidth={2.8} />
        </div>
      </div>
      <h3 className={`${D} mb-3 text-xl font-black tracking-normal text-[#111111] sm:mb-6 sm:text-3xl`}>{title}</h3>
      <ul className="mt-auto space-y-2 sm:space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className={`${B} flex items-start gap-2 text-[12px] font-semibold leading-5 text-[#334155] sm:gap-3 sm:text-sm sm:leading-normal`}
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#111111] sm:h-4 sm:w-4" strokeWidth={2.8} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── TrustItem ──────────────────────────────────────────────── */
function TrustItem({ icon: Icon = CheckCircle2, title, desc, isZi = false }) {
  return (
    <div
      className={`${styles.reveal} motion-safe:hover:translate-x-1 motion-safe:transition-transform flex items-start gap-3 border-[3px] border-[#111111] bg-white p-3 shadow-[4px_4px_0_#111111] sm:gap-4 sm:p-4 sm:shadow-[5px_5px_0_#111111]`}
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-[#111111] bg-[#F4B400] sm:h-11 sm:w-11">
        {isZi ? (
          <div className="flex gap-1">
            <div className={`${styles.dot} h-1.5 w-1.5 bg-black`} />
            <div className={`${styles.dot} h-1.5 w-1.5 bg-black`} />
            <div className={`${styles.dot} h-1.5 w-1.5 bg-black`} />
          </div>
        ) : (
          <Icon className="h-4 w-4 text-[#111111] sm:h-5 sm:w-5" strokeWidth={3} />
        )}
      </div>
      <div>
        <h4 className={`${D} mb-0.5 text-base font-black leading-snug text-[#111111] sm:mb-1 sm:text-lg`}>
          {title}
        </h4>
        <p className={`${B} text-[13px] font-semibold leading-5 text-[#475569] sm:text-sm sm:leading-6`}>{desc}</p>
      </div>
    </div>
  );
}

/* ── StatItem ───────────────────────────────────────────────── */
function StatItem({ value, label, tone }) {
  return (
    <div
      className={`${styles.reveal} motion-safe:hover:-translate-y-1 motion-safe:transition min-h-[104px] border-[3px] border-[#111111] p-3 text-left shadow-[4px_4px_0_#111111] transition-shadow duration-200 hover:shadow-[6px_6px_0_#111111] sm:min-h-[150px] sm:p-5 sm:shadow-[7px_7px_0_#111111] sm:hover:shadow-[10px_10px_0_#111111] ${tone}`}
    >
      <div className={`${D} mb-1 text-[1.72rem] font-black leading-none tracking-normal text-[#111111] sm:mb-2 sm:text-4xl md:text-5xl`}>
        {value}
      </div>
      <div className={`${B} max-w-[12rem] text-[10px] font-black uppercase leading-4 tracking-wide text-[#111111] sm:text-sm sm:leading-5`}>{label}</div>
    </div>
  );
}

/* ── ProductPreview — mock PYQ question card ────────────────── */
function ProductPreview() {
  return (
    <div
      className={`${styles.preview} relative bg-white border-[3px] border-[#111111] shadow-[5px_5px_0_#111111] overflow-visible sm:shadow-[12px_12px_0_#111111]`}
    >
      <div className="absolute -left-5 -top-5 hidden h-20 w-20 border-[3px] border-[#111111] bg-[#F4B400] md:block" />
      <div className="absolute -bottom-6 -right-6 hidden h-24 w-24 rotate-6 border-[3px] border-[#111111] bg-[#FFEE99] md:block" />
      <div className="absolute -right-7 top-16 hidden border-[3px] border-[#111111] bg-white px-3 py-1 text-xs font-black uppercase tracking-widest text-[#111111] shadow-[4px_4px_0_#111111] md:block">
        Practice preview
      </div>
      {/* Exam header bar */}
      <div className="relative z-10 bg-[#111111] px-3 py-3 flex items-center justify-between gap-2 sm:px-4 sm:py-4 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#F4B400] shrink-0" />
          <span className={`${B} text-white text-[12px] font-black truncate sm:text-sm`}>
            Illustrative Physics question
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 sm:gap-3">
          <span className={`${B} text-white/70 text-[11px] flex items-center gap-1 font-bold sm:text-xs`}>
            <Clock className="w-3 h-3" />
            2:45
          </span>
          <span className="bg-[#F4B400] text-black text-[11px] px-1.5 py-0.5 font-black sm:text-xs sm:px-2 sm:py-1">
            Q 12 / 30
          </span>
        </div>
      </div>

      {/* Question body */}
      <div className="relative z-10 p-3 sm:p-6">
        <p className={`${B} text-[13px] font-semibold text-[#111111] leading-6 mb-3 sm:mb-5 sm:text-base sm:leading-7`}>
          A particle of mass <strong>m</strong> moves in a circular orbit of radius{" "}
          <strong>r</strong> in a central force potential{" "}
          <code className="text-[12px] bg-[#FFEE99] border-2 border-[#111111] px-1 py-0.5 font-mono sm:text-sm sm:px-1.5">
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
          ].map((opt) => (
            <div
              key={opt.label}
              className={`flex items-center gap-1.5 border-2 px-2 py-2 text-sm cursor-default select-none sm:gap-2.5 sm:px-3 sm:py-3
                ${
                  opt.correct
                    ? "border-[#111111] bg-[#D8F7D8] text-[#111111] shadow-[3px_3px_0_#111111] sm:shadow-[4px_4px_0_#111111]"
                    : "border-[#111111] bg-white text-[#111111]"
                }`}
            >
              <span
                className={`w-5 h-5 text-[11px] font-black flex items-center justify-center shrink-0 border-2 border-[#111111] sm:h-6 sm:w-6 sm:text-xs
                  ${opt.correct ? "bg-[#00B85C] text-white" : "bg-[#F8F1D9] text-[#111111]"}`}
              >
                {opt.label}
              </span>
              <span className={`${B} text-[12px] font-black sm:text-sm`}>{opt.text}</span>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-3 border-t-[3px] border-[#111111] pt-3 flex flex-row items-center justify-between gap-2 overflow-hidden sm:mt-5 sm:pt-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <span
              className={`${B} text-[11px] font-bold text-[#334155] sm:text-xs`}
            >
              <span className="font-black text-[#111111]">Demo</span> preview
            </span>
            <span
              className={`${B} text-[11px] font-bold text-[#334155] sm:text-xs`}
            >
              Illustrative content
            </span>
          </div>
          <span
            className={`${B} w-fit bg-[#F4B400] px-1.5 py-0.5 text-[10px] font-black uppercase text-black border-2 border-[#111111] sm:px-2 sm:py-1 sm:text-xs`}
          >
            Medium
          </span>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="relative z-10 px-3 pb-4 sm:px-6 sm:pb-5">
        <div className="flex items-center justify-between mb-1">
          <span className={`${B} text-xs font-black uppercase text-[#111111]`}>Progress</span>
          <span className={`${B} text-xs font-bold text-[#334155]`}>12 / 30 questions</span>
        </div>
        <div className="h-3 w-full overflow-hidden border-2 border-[#111111] bg-white">
          <div
            className={`w-2/5 ${styles.progress} h-full bg-[#F4B400]`}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function PublicLandingPage() {
  return (
    <>
      {fontPreloads.landing.map(href => <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />)}
      <div
        className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-white text-[#334155] ${B} selection:bg-yellow-100`}
      >
      {/* ════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b-[3px] border-[#111111] bg-[#FFF9E6] shadow-[0_5px_0_#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" aria-label="PrepZii Home" className="flex items-center">
            <Logo forceLight size={44} />
          </Link>

          {/* Nav links — desktop only */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border-2 border-[#111111] bg-white p-1 shadow-[3px_3px_0_#111111]">
            <Link
              href="/jee"
              className={`${B} rounded-full px-4 py-1 text-sm font-black text-[#111111] transition-all duration-150 hover:bg-[#FFF9E6]`}
            >
              JEE
            </Link>
            <Link
              href="/neet"
              className={`${B} rounded-full px-4 py-1 text-sm font-black text-[#111111] transition-all duration-150 hover:bg-[#FFF9E6]`}
            >
              NEET
            </Link>
            <Link
              href="/pricing"
              className={`${B} rounded-full px-4 py-1 text-sm font-black text-[#111111] transition-all duration-150 hover:bg-[#FFF9E6]`}
            >
              Pricing
            </Link>
          </nav>

          {/* Auth CTAs */}
          <LandingAuthLinks />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:hidden">
          <PublicExamNavigation mobileOnly />
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#FFF9E6] border-b-[3px] border-[#111111]">
        <div className="absolute left-0 top-24 hidden h-24 w-24 -translate-x-1/2 rotate-12 border-[3px] border-[#111111] bg-white md:block" />
        <div className="absolute right-8 top-28 hidden h-12 w-36 -rotate-6 border-[3px] border-[#111111] bg-[#F4B400] lg:block" />
        <div className="absolute bottom-14 left-[48%] hidden h-16 w-16 rotate-45 border-[3px] border-[#111111] bg-[#FFEE99] lg:block" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-12 md:py-20 lg:py-24">
          <div className="grid gap-7 sm:gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-14">
            {/* Left: Copy */}
            <div className="max-w-3xl">
              {/* Eyebrow badge */}
              <div
                className={`${B} mb-4 inline-flex -rotate-1 items-center gap-2 border-[3px] border-[#111111] bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#111111] shadow-[4px_4px_0_#111111] sm:mb-6 sm:px-3 sm:py-2 sm:text-xs sm:shadow-[5px_5px_0_#111111]`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                JEE &amp; NEET Preparation Platform
              </div>

              {/* Heading */}
              <h1
                className={`${D} mb-4 max-w-[880px] text-[2.55rem] font-black leading-[0.95] tracking-normal text-[#111111] min-[375px]:text-5xl sm:mb-6 sm:text-6xl md:text-7xl lg:text-[5.7rem]`}
              >
                <span className="block">The structured way</span>
                <span className="block">to crack</span>
                <span className="relative mt-1 inline-block -rotate-1 border-[3px] border-[#111111] bg-[#F4B400] px-2 pb-1.5 pt-0.5 text-black shadow-[5px_5px_0_#111111] sm:mt-2 sm:px-3 sm:pb-2 sm:pt-1 sm:shadow-[8px_8px_0_#111111]">
                  JEE &amp; NEET
                  <span
                    className={`w-full ${styles.progress} absolute -bottom-3 left-0 h-[5px] bg-[#111111]`}
                  />
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className={`${B} mb-5 max-w-2xl border-l-[5px] border-[#111111] pl-3 text-[15px] font-semibold leading-6 text-[#334155] sm:mb-8 sm:border-l-[6px] sm:pl-5 sm:text-xl sm:leading-8`}
              >
                Practice with previous-year questions, take full-length mock tests, revise
                formula books, detect weak chapters, and track your performance —
                all in one focused workspace.
              </p>

              {/* CTA buttons */}
              <div
                className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-8"
              >
                <div>
                  <Link
                    href="/dashboard"
                    prefetch={false}
                    className={`${B} group inline-flex items-center justify-center gap-2 border-[3px] border-[#111111] bg-[#F4B400] px-5 py-3 text-sm font-black text-black shadow-[5px_5px_0_#111111] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_#111111] sm:gap-3 sm:px-7 sm:py-4 sm:text-base sm:shadow-[7px_7px_0_#111111] sm:hover:shadow-[10px_10px_0_#111111]`}
                  >
                    Start Preparing Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={3} />
                  </Link>
                </div>
              </div>

              {/* Trust signals */}
              <div
                className={`${B} grid grid-cols-2 gap-2 text-[12px] text-[#111111] sm:flex sm:flex-wrap sm:text-sm`}
              >
                {[
                  "Free to start",
                  "PYQ practice",
                  "Real exam interface",
                  "No clutter",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 border-2 border-[#111111] bg-white px-2 py-1 font-black shadow-[2px_2px_0_#111111] sm:px-3 sm:py-1.5 sm:shadow-[3px_3px_0_#111111]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00A651] shrink-0" strokeWidth={3} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Product preview */}
            <div className="w-full lg:pl-2">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STATS BAND
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b-[3px] border-[#111111] py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatItem value="PYQs" label="Previous-year paper practice" tone="bg-[#F4B400]" />
            <StatItem value="Mock Tests" label="Exam-style practice · Pro access" tone="bg-[#111111] [&_*]:text-white" />
            <StatItem value="4 Subjects" label="Physics, Chemistry, Bio, Maths" tone="bg-[#FFEE99]" />
            <StatItem value="Revision" label="Formula and concept cards" tone="bg-white" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PREPARATION WORKFLOW
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#FFF9E6] py-8 sm:py-14 md:py-20 border-b-[3px] border-[#111111]">
        <div className="absolute right-0 top-12 hidden h-28 w-28 translate-x-10 border-[3px] border-[#111111] bg-white lg:block" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6 grid gap-4 sm:mb-12 sm:gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <p
              className={`${styles.reveal} ${B} w-fit border-[3px] border-[#111111] bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#111111] shadow-[3px_3px_0_#111111] sm:px-3 sm:py-2 sm:text-xs sm:shadow-[4px_4px_0_#111111]`}
            >
              How PrepZii works
            </p>
            <div>
              <h2
                className={`${styles.reveal} ${D} mb-2 text-[2rem] font-black leading-[0.98] tracking-normal text-[#111111] sm:mb-4 sm:text-4xl md:text-6xl`}
              >
                Your complete preparation workflow
              </h2>
              <p
                className={`${styles.reveal} ${B} max-w-3xl text-sm font-semibold leading-6 text-[#334155] sm:text-lg sm:leading-8`}
              >
                Move from concept review to PYQ practice, full mock tests, deep
                analysis, and targeted improvement — without switching tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:flex lg:flex-row lg:flex-nowrap lg:items-stretch lg:justify-center lg:gap-0">
            <WorkflowStep
              number="1"
              icon={BookOpen}
              title="Learn"
              desc="Review formulas and concepts with digital handbooks"

            />
            <WorkflowConnector />
            <WorkflowStep
              number="2"
              icon={Target}
              title="Practice"
              desc="Solve chapter-wise PYQs from JEE & NEET past papers"

            />
            <WorkflowConnector />
            <WorkflowStep
              number="3"
              icon={TestTube2}
              title="Test"
              desc="Take full-length timed mocks under real exam conditions"

            />
            <WorkflowConnector />
            <WorkflowStep
              number="4"
              icon={LineChart}
              title="Analyze"
              desc="Review accuracy, speed, and performance metrics"

            />
            <WorkflowConnector />
            <WorkflowStep
              number="5"
              icon={Brain}
              title="Improve"
              desc="Target the weak chapters your analytics surface"

            />
            <WorkflowConnector />
            <WorkflowStep
              number="6"
              icon={MessageSquare}
              title="Discuss"
              desc="Resolve doubts with AI or peer study groups"

            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOUR PILLARS
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white py-8 sm:py-14 md:py-20 border-b-[3px] border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-12 sm:gap-5 md:flex-row md:items-end">
            <h2
              className={`${styles.reveal} ${D} max-w-2xl text-[2rem] font-black leading-none tracking-normal text-[#111111] sm:text-4xl md:text-6xl`}
            >
              Everything you need to prepare
            </h2>
            <p
              className={`${styles.reveal} ${B} max-w-sm border-[3px] border-[#111111] bg-[#F4B400] p-3 text-sm font-black leading-5 text-[#111111] shadow-[4px_4px_0_#111111] sm:p-4 sm:text-base sm:leading-6 sm:shadow-[5px_5px_0_#111111]`}
            >
              Four focused tools. One distraction-free workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            <PillarCard
              icon={Target}
              title="Practice"
              items={[
                "Extensive PYQ library",
                "Full-length mock tests",
                "Chapter-wise drills",
                "Custom test creation",
              ]}
              accentClass="bg-[#F4B400]"
              label="PYQ"

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
              accentClass="bg-[#DDEBFF]"
              label="Loop"

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
              accentClass="bg-[#D8F7D8]"
              label="Data"

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
              accentClass="bg-[#FFE0E6]"
              label="Peer"

            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST / AUTHENTICITY
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#FFF9E6] py-8 sm:py-14 md:py-20 border-b-[3px] border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-6 sm:gap-10 lg:gap-14 items-center">
            {/* Left: copy */}
            <div>
              <p
                className={`${styles.reveal} ${B} mb-4 w-fit border-[3px] border-[#111111] bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#111111] shadow-[3px_3px_0_#111111] sm:mb-5 sm:px-3 sm:py-2 sm:text-xs sm:shadow-[4px_4px_0_#111111]`}
              >
                Why PrepZii
              </p>
              <h2
                className={`${styles.reveal} ${D} mb-4 max-w-2xl text-[2rem] font-black leading-[1.02] tracking-normal text-[#111111] sm:mb-6 sm:text-4xl md:text-6xl`}
              >
                Built around{" "}
                <span className="inline-block -rotate-1 border-[3px] border-[#111111] bg-[#F4B400] px-1.5 pb-0.5 text-black shadow-[4px_4px_0_#111111] sm:px-2 sm:pb-1 sm:shadow-[5px_5px_0_#111111]">real exam work,</span>
                {" "}with AI that helps
              </h2>
              <p
                className={`${styles.reveal} ${B} mb-5 max-w-2xl text-sm font-semibold leading-6 text-[#334155] sm:mb-8 sm:text-lg sm:leading-8`}
              >
                PrepZii brings together previous-year questions and focused exam
                workflows. Zi helps you understand, revise, plan, and improve
                without getting in the way of your preparation.
              </p>

              <div className="space-y-3 sm:space-y-5">
                <TrustItem
                  title="PYQ practice"
                  desc="Choose from available previous-year papers and practice options for your exam."

                />
                <TrustItem
                  title="Real exam UI"
                  desc="Practice in an environment that closely mirrors the actual CBT interface."

                />
                <TrustItem
                  title="Zi — your study companion"
                  desc="Ask Zi to explain any question, suggest what to revise next, or help you understand a concept you're stuck on."

                  isZi={true}
                />
                <TrustItem
                  title="Habits that stick"
                  desc="Streaks, XP, and personalised revision plans built around your weak chapters and exam schedule."

                />
              </div>
            </div>

            {/* Right: analytics illustration */}
            <div
              className={`${styles.reveal} flex items-center justify-center`}
            >
              <div className="relative w-full max-w-[270px] aspect-square border-[3px] border-[#111111] bg-white shadow-[5px_5px_0_#111111] min-[375px]:max-w-[300px] sm:max-w-md sm:shadow-[12px_12px_0_#111111]">
                {/* Decorative rings */}
                <div className="absolute left-4 top-4 h-16 w-16 border-[3px] border-[#111111] bg-[#F4B400] sm:left-6 sm:top-6 sm:h-24 sm:w-24" />
                <div className="absolute bottom-5 right-5 h-14 w-14 rotate-12 border-[3px] border-[#111111] bg-[#FFEE99] sm:bottom-7 sm:right-8 sm:h-20 sm:w-20" />
                <div className="absolute inset-7 border-[3px] border-dashed border-[#111111] sm:inset-10" />

                {/* Central graph visual */}
                <div className="absolute inset-11 flex items-center justify-center border-[3px] border-[#111111] bg-[#FFF9E6] p-5 sm:inset-16 sm:p-8">
                  <GraphVisual className="w-full h-full text-[#41667D]" />
                </div>

                {/* Stat pill — top right */}
                <div
                  className={`${styles.reveal} absolute right-2 top-2 bg-white border-[3px] border-[#111111] px-2.5 py-2 shadow-[3px_3px_0_#111111] text-left sm:right-4 sm:top-4 sm:px-4 sm:py-3 sm:shadow-[5px_5px_0_#111111]`}
                >
                  <div className={`${B} text-[10px] font-black uppercase text-[#64748B] mb-0.5`}>Example accuracy</div>
                  <div className={`${D} text-lg font-black text-[#111111] sm:text-2xl`}>88%</div>
                </div>

                {/* Stat pill — bottom left */}
                <div
                  className={`${styles.reveal} absolute bottom-4 left-2 bg-white border-[3px] border-[#111111] px-2.5 py-2 shadow-[3px_3px_0_#111111] text-left sm:bottom-7 sm:left-4 sm:px-4 sm:py-3 sm:shadow-[5px_5px_0_#111111]`}
                >
                  <div className={`${B} text-[10px] font-black uppercase text-[#64748B] mb-0.5`}>Weak chapter</div>
                  <div className={`${D} text-[12px] font-black text-[#111111] sm:text-base`}>Thermodynamics</div>
                  <div className="w-20 bg-white border-2 border-[#111111] h-2 mt-1.5 overflow-hidden sm:mt-2 sm:w-24">
                    <div
                      className={`w-[30%] h-full bg-[#B44436]`}
                    />
                  </div>
                </div>

                {/* Streak pill — bottom right */}
                <div
                  className={`${styles.reveal} absolute bottom-3 right-2 bg-[#F4B400] border-[3px] border-[#111111] px-2.5 py-2 shadow-[3px_3px_0_#111111] text-left sm:bottom-5 sm:right-4 sm:px-4 sm:py-3 sm:shadow-[5px_5px_0_#111111]`}
                >
                  <div className={`${B} text-[10px] font-black uppercase text-black/60 mb-0.5`}>Example streak</div>
                  <div className={`${D} text-base font-black text-black sm:text-xl`}>14 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SUBJECTS
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white py-8 sm:py-14 md:py-20 border-b-[3px] border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6 grid gap-4 sm:mb-12 sm:gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <h2
              className={`${styles.reveal} ${D} max-w-2xl text-[2rem] font-black leading-none tracking-normal text-[#111111] sm:text-4xl md:text-6xl`}
            >
              Explore your exam subjects.
            </h2>
            <p
              className={`${styles.reveal} ${B} max-w-sm border-[3px] border-[#111111] bg-[#FFF9E6] p-3 text-sm font-bold leading-5 text-[#334155] shadow-[4px_4px_0_#111111] sm:p-4 sm:text-base sm:leading-6 sm:shadow-[5px_5px_0_#111111]`}
            >
              Practice and revision resources for JEE and NEET subjects. Availability varies by exam and chapter.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {[
              {
                subject: "Physics",
                icon: Zap,
                desc: "Mechanics · Optics · Electricity · Modern Physics",
                bgClass: "bg-[#DDEBFF]",
                rotate: "-rotate-1",
                tag: "PH",
              },
              {
                subject: "Chemistry",
                icon: FlaskConical,
                desc: "Organic · Inorganic · Physical · Coordination",
                bgClass: "bg-[#D8F7D8]",
                rotate: "rotate-1",
                tag: "CH",
              },
              {
                subject: "Biology",
                icon: Dna,
                desc: "Botany · Zoology · Human Physiology · Genetics",
                bgClass: "bg-[#FFE0E6]",
                rotate: "-rotate-1",
                tag: "BIO",
              },
              {
                subject: "Mathematics",
                icon: Calculator,
                desc: "Calculus · Algebra · Coordinate Geometry · Probability",
                bgClass: "bg-[#FFEE99]",
                rotate: "rotate-1",
                tag: "MATH",
              },
            ].map((s) => (
              <div
                key={s.subject}
                className={`${styles.reveal} motion-safe:hover:-translate-y-1 motion-safe:transition motion-safe:hover:rotate-0 group border-[3px] border-[#111111] p-3 shadow-[4px_4px_0_#111111] transition-shadow duration-200 hover:shadow-[6px_6px_0_#F4B400] sm:min-h-[230px] sm:p-5 sm:shadow-[8px_8px_0_#111111] sm:hover:shadow-[11px_11px_0_#F4B400] ${s.bgClass} ${s.rotate}`}
              >
                <div className="mb-4 flex items-start justify-between gap-2 sm:mb-8 sm:gap-3">
                  <s.icon className="h-6 w-6 text-[#111111] sm:h-9 sm:w-9" strokeWidth={2.8} />
                  <span className={`${D} border-[3px] border-[#111111] bg-white px-1.5 py-0.5 text-[11px] font-black text-[#111111] shadow-[2px_2px_0_#111111] sm:px-2 sm:py-1 sm:text-sm sm:shadow-[3px_3px_0_#111111]`}>
                    {s.tag}
                  </span>
                </div>
                <h3 className={`${D} mb-2 text-xl font-black tracking-normal text-[#111111] sm:mb-3 sm:text-3xl`}>
                  {s.subject}
                </h3>
                <p className={`${B} text-[12px] font-semibold leading-5 text-[#334155] sm:text-sm sm:leading-6`}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#111111] py-8 sm:py-14 md:py-20">
        <div className="absolute left-6 top-6 hidden h-20 w-20 border-[3px] border-white bg-[#F4B400] md:block" />
        <div className="absolute bottom-8 right-8 hidden h-28 w-28 rotate-12 border-[3px] border-white bg-transparent md:block" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div
            className={`${styles.reveal} border-[3px] border-white bg-[#F4B400] p-4 text-center shadow-[6px_6px_0_#FFFFFF] sm:p-6 sm:shadow-[12px_12px_0_#FFFFFF] md:p-10`}
          >
            <h2
              className={`${D} mx-auto mb-3 max-w-4xl text-[2rem] font-black leading-[0.98] tracking-normal text-[#111111] sm:mb-5 sm:text-4xl md:text-6xl`}
            >
              Ready for a clearer{" "}
              <span className="inline-block bg-[#111111] px-2 pb-1 text-white">study routine?</span>
            </h2>
            <p
              className={`${B} mx-auto mb-5 max-w-2xl text-sm font-bold leading-6 text-[#111111] sm:mb-8 sm:text-lg sm:leading-8`}
            >
              Start with a workspace built for PYQs, mock tests, formula
              revision, and steady performance improvement. Free to begin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div>
                <Link
                  href="/dashboard"
                  prefetch
                  className={`${B} group inline-flex items-center justify-center gap-2 border-[3px] border-[#111111] bg-white px-5 py-3 text-sm font-black text-black shadow-[5px_5px_0_#111111] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_#111111] sm:gap-3 sm:px-8 sm:py-4 sm:text-base sm:shadow-[7px_7px_0_#111111] sm:hover:shadow-[10px_10px_0_#111111]`}
                >
                  Start Preparing Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={3} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer className="bg-[#0F1720] py-5 sm:py-8 border-t-[3px] border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-5 text-xs sm:text-sm text-gray-400">
          <div className="flex items-center gap-2 font-bold sm:gap-3">
            <Logo forceDark size={36} />
            <span>© {new Date().getFullYear()} PrepZii Systems</span>
          </div>
          <nav className={`${B} flex items-center gap-2 font-black uppercase tracking-wide`}>
            <Link href="/jee" className="border-2 border-transparent px-2 py-1 transition-colors hover:border-white hover:text-white">
              JEE
            </Link>
            <Link href="/neet" className="border-2 border-transparent px-2 py-1 transition-colors hover:border-white hover:text-white">
              NEET
            </Link>
            <Link href="/pricing" className="border-2 border-transparent px-2 py-1 transition-colors hover:border-white hover:text-white">
              Pricing
            </Link>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 sm:text-xs">Built for focused exam preparation.</p>
        </div>
      </footer>
    </div>
    </>
  );
}
