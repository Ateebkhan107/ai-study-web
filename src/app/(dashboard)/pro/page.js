"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createOrder, openRazorpayCheckout } from "@/lib/payment";
import PageWrapper from "@/components/PageWrapper";
import {
  Check,
  X,
  Star,
  Zap,
  Shield,
  Clock,
  Users,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Bot,
  Brain,
  Target,
  RotateCcw,
  BarChart2,
  Lock,
  Flame,
  Award,
} from "lucide-react";

const FREE_FEATURES = [
  { text: "Full-paper, random and saved PYQ practice", included: true },
  { text: "Daily Warmup exercises", included: true },
  { text: "2 custom tests per month", included: true },
  { text: "Complete formula handbooks", included: true },
  { text: "Global leaderboard and community", included: true },
  { text: "Chapter-wise PYQs and mistake redo", included: false },
  { text: "Quick tests and premium full mock tests", included: false },
  { text: "Advanced PYQ analytics and revision insights", included: false },
  { text: "AI-powered step-by-step explanations", included: false },
  { text: "100% Ad-free experience", included: false },
];

const PRO_FEATURES = [
  { text: "Everything included in Free plan", hot: false },
  { text: "Unlimited custom tests & mock generators", hot: true },
  { text: "Quick tests & full-length timed mock tests", hot: true },
  { text: "Chapter-wise PYQs & automated mistake redo deck", hot: true },
  { text: "Deep chapter analytics, trends & weak-spot alerts", hot: true },
  { text: "AI-powered question explanations & hints", hot: true },
  { text: "100% distraction-free & ad-free experience", hot: false },
];

const AI_MODE_FEATURES = [
  { text: "Everything included in Pro plan", hot: false },
  { text: "Full Zi AI Study Companion (Voice + Visuals)", hot: true },
  { text: "High-capacity AI usage & instant doubt solving", hot: true },
  { text: "Personalized study memory & weak-area tracking", hot: true },
  { text: "Autonomous daily & weekly AI study plans", hot: true },
  { text: "Step-by-step interactive problem breakdown", hot: true },
];

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: 49,
    originalPrice: 199,
    discount: 75,
    per: "month",
    total: 49,
    badge: null,
    savings: null,
    highlight: "Flexible access",
  },
  {
    id: "quarterly",
    label: "Quarterly",
    price: 129,
    originalPrice: 499,
    discount: 74,
    per: "3 months",
    total: 129,
    badge: "Most Popular",
    savings: "Save ₹370",
    highlight: "Best for steady prep",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: 399,
    originalPrice: 1799,
    discount: 78,
    per: "year",
    total: 399,
    badge: "Best Value",
    savings: "Save ₹1,400",
    highlight: "Full academic session",
  },
  {
    id: "ai_mode",
    label: "AI Mode",
    price: 1999,
    originalPrice: 3699,
    discount: 54,
    per: "month",
    total: 1999,
    badge: "Premium AI",
    savings: null,
    highlight: "Complete AI Co-pilot",
  },
];

const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3, ai_mode: 4 };

const BENTO_CARDS = [
  {
    icon: Target,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    title: "Chapter-wise PYQ Mastery",
    desc: "Target high-yield chapters with 15+ years of authentic PYQs, instant filters, and deep classification.",
  },
  {
    icon: RotateCcw,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    title: "Smart Mistake Redo Deck",
    desc: "Every wrong answer is automatically filed into your smart redo deck so you never repeat mistakes on exam day.",
  },
  {
    icon: BarChart2,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    title: "Precision Weak-Area Analytics",
    desc: "Visual charts reveal accuracy trends, subject bottlenecks, and high-frequency topics needing revision.",
  },
  {
    icon: Brain,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    title: "Zi AI Instant Doubt Solver",
    desc: "Ask any conceptual question, get voice & visual breakdowns, and unlock customized daily schedules.",
  },
];

const FAQS = [
  {
    q: "Can I cancel or change my subscription?",
    a: "PrepZii subscriptions are fixed-term passes. You can upgrade or switch plans anytime, and your new duration will be added immediately.",
  },
  {
    q: "Which payment methods are supported?",
    a: "We support UPI (GPay, PhonePe, Paytm), credit/debit cards, Net Banking, and major wallets via secure 256-bit encrypted Razorpay checkout.",
  },
  {
    q: "Will my practice progress and test data be saved if my plan expires?",
    a: "Yes, 100%! All your test attempts, accuracy records, bookmarks, and mistake redo lists are permanently preserved on your account.",
  },
  {
    q: "What is the difference between Pro and AI Mode?",
    a: "Pro unlocks all unlimited testing, chapter PYQs, mistake redo, and deep analytics. AI Mode includes all Pro features plus the full Zi AI Voice & Visual companion, personalized study memory, and higher AI prompt limits.",
  },
];

export default function ProPage() {
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [selectedTrack, setSelectedTrack] = useState("JEE");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const plan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  useEffect(() => {
    let cancelled = false;

    async function loadProfileTrack() {
      if (!user) return;

      const profileResponse = await fetch("/api/profile", { cache: "no-store" });
      if (!profileResponse.ok) return;
      const profile = await profileResponse.json();
      const profileTrack = profile?.exam === "NEET" ? "NEET" : "JEE";
      const subscriptionResponse = await fetch(`/api/subscription?examTrack=${profileTrack}`, {
        cache: "no-store",
      });
      const subscriptionData = subscriptionResponse.ok ? await subscriptionResponse.json() : null;

      if (!cancelled) {
        setSelectedTrack(profileTrack);
        const activePlan = subscriptionData?.isPro ? subscriptionData.subscription?.plan : null;
        setCurrentPlan(activePlan);
        if (activePlan === "monthly") setSelectedPlan("quarterly");
        if (activePlan === "quarterly") setSelectedPlan("yearly");
        if (activePlan === "yearly") setSelectedPlan("yearly");
      }
    }

    loadProfileTrack();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSubscribe = async () => {
    if (loading || (currentPlan && PLAN_RANK[selectedPlan] <= PLAN_RANK[currentPlan])) return;

    try {
      setLoading(true);
      const order = await createOrder(selectedPlan, selectedTrack);
      await openRazorpayCheckout(order);
    } catch (err) {
      alert(err.message || "Unable to start payment.");
      setLoading(false);
    }
  };

  const isCurrentPlanSelected = Boolean(currentPlan && PLAN_RANK[plan.id] <= PLAN_RANK[currentPlan]);

  return (
    <PageWrapper
      title=""
      badge="PREPZII PRO"
      badgeIcon={<Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
      badgeVariant="brand"
    >
      <div className="relative mx-auto max-w-6xl space-y-12 sm:space-y-16 pb-12">
        {/* ── Background Glow Effects ── */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-96 w-full -translate-x-1/2 max-w-4xl overflow-hidden blur-3xl opacity-30 dark:opacity-20">
          <div className="h-full w-full bg-gradient-to-tr from-amber-400 via-indigo-500 to-pink-500" />
        </div>

        {/* ── Header Section ── */}
        <section className="space-y-5 text-center animate-slideUp">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Supercharged Exam Intelligence</span>
            <span className="h-1 w-1 rounded-full bg-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{selectedTrack} Aspirants</span>
          </div>

          <h1 className="text-4xl font-black font-display tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl leading-[1.08]">
            Crack Your Exam With{" "}
            <span className="relative inline-block bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Precision & Speed
              <svg
                className="absolute -bottom-2 left-0 w-full text-amber-500/30 -z-10"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 9.5C60 3 180 3 298 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Unlimited timed mocks, chapter-wise authentic PYQs, automated mistake redo, and instant AI explanations tailored specifically for{" "}
            <strong className="text-slate-900 dark:text-white">{selectedTrack}</strong>.
          </p>

          {/* Exam Switcher Tab */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exam Track:</span>
            <div className="inline-flex rounded-xl border border-slate-200/80 bg-[var(--card)]/90 p-1 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
              {["JEE", "NEET"].map((track) => (
                <button
                  key={track}
                  type="button"
                  onClick={() => setSelectedTrack(track)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedTrack === track
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {track} Pro
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Interactive Pricing & Plan Selector ── */}
        <section className="animate-slideUp" style={{ animationDelay: "100ms" }}>
          {/* Plan Selector Buttons */}
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/70 bg-[var(--card)]/80 p-2 shadow-sm backdrop-blur-xl dark:border-[var(--border)] dark:bg-[var(--surface)]/80 sm:grid-cols-4">
              {PLANS.map((p) => {
                const isSelected = selectedPlan === p.id;
                const isAi = p.id === "ai_mode";
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative flex min-h-[68px] flex-col items-center justify-center rounded-xl p-2 text-center transition-all duration-300 ${
                      isSelected
                        ? isAi
                          ? "bg-gradient-to-b from-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-purple-400/40"
                          : "bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40"
                        : "hover:bg-slate-100/70 dark:hover:bg-[var(--surface-elevated)]/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {/* Top Savings or Badge Tag */}
                    {p.badge && (
                      <span
                        className={`absolute -top-2.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${
                          isSelected
                            ? "bg-white text-slate-900"
                            : isAi
                            ? "bg-purple-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}

                    <span className="text-xs font-black sm:text-sm">{p.label}</span>
                    <span className={`text-[11px] font-semibold opacity-90 ${isSelected ? "text-white/90" : "text-slate-500 dark:text-slate-400"}`}>
                      ₹{p.price}
                      <span className="text-[10px]">/{p.id === "quarterly" ? "3mo" : p.id === "yearly" ? "yr" : "mo"}</span>
                    </span>

                    {p.savings && !p.badge && (
                      <span className="mt-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        {p.savings}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Featured Pricing Box */}
          <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-[var(--card)] via-[var(--card)] to-slate-50/50 p-6 shadow-xl backdrop-blur-xl dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--surface-elevated)]/40 sm:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
              {/* Left Column: Plan Details & Price */}
              <div className="space-y-4 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-[var(--surface-elevated)] dark:text-slate-300">
                    {selectedTrack} {plan.label} Plan
                  </span>
                  <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm shadow-emerald-500/20">
                    {plan.discount}% OFF
                  </span>
                  {plan.savings && (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 text-[11px] font-bold border border-emerald-500/20">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-center gap-2 md:justify-start">
                  <span className="text-xl font-bold text-slate-400 line-through decoration-2 dark:text-slate-600 sm:text-2xl">
                    ₹{plan.originalPrice}
                  </span>
                  <span className="text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                    ₹{plan.price}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    /{plan.per}
                  </span>
                </div>

                <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 md:justify-start">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Limited-time discounted offer active
                </p>

                {/* Instant Highlights */}
                <div className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-amber-500 font-bold" />
                    <span>Instant access to 15+ years chapter PYQs & tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-amber-500 font-bold" />
                    <span>Automated Mistake Redo Deck & Spaced Repetition</span>
                  </div>
                  {selectedPlan === "ai_mode" ? (
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold">
                      <Bot className="h-4 w-4 shrink-0 text-purple-500" />
                      <span>Full Zi AI Voice, Visual & Memory Study Companion</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-amber-500 font-bold" />
                      <span>Step-by-step AI question hints & explanations</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: CTA & Trust */}
              <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl bg-slate-100/60 p-5 dark:bg-[var(--surface-elevated)]/50 sm:p-6">
                <button
                  onClick={handleSubscribe}
                  disabled={loading || isCurrentPlanSelected}
                  className={`group w-full py-4 px-6 rounded-2xl text-base font-black transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${
                    isCurrentPlanSelected
                      ? "bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                      : selectedPlan === "ai_mode"
                      ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white hover:-translate-y-1 hover:shadow-purple-500/25"
                      : "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 font-black hover:-translate-y-1 hover:shadow-amber-500/25"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Securing Order...</span>
                    </>
                  ) : isCurrentPlanSelected ? (
                    <span>Current Active Plan</span>
                  ) : (
                    <>
                      <span>{currentPlan ? `Upgrade to ${plan.label} • ₹${plan.total}` : `Get ${selectedTrack} Pro • ₹${plan.total}`}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-1.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span>256-Bit SSL Encrypted Checkout via Razorpay</span>
                  </div>
                  <span>Instant activation • Works across Mobile & Desktop</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Comparison Matrix ── */}
        <section className="space-y-6 animate-slideUp" style={{ animationDelay: "150ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Clear & Transparent
            </span>
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white sm:text-3xl">
              Compare Plans & Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-3xl border border-slate-200/80 bg-[var(--card)] p-6 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)] flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Free Tier</span>
                  <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white">Basic</h3>
                  <p className="mt-1 text-3xl font-black text-slate-400 dark:text-slate-500">
                    ₹0<span className="text-sm font-normal">/forever</span>
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  {FREE_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      {f.included ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 mt-0.5" />
                      )}
                      <span className={f.included ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-400 dark:text-slate-600 line-through"}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PRO Plan */}
            <div className="relative rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[var(--card)] to-amber-500/5 p-6 shadow-xl shadow-amber-500/10 dark:from-[var(--surface)] dark:to-amber-500/10 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Unlimited Exam Prep</span>
                  <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedTrack} PRO
                  </h3>
                  <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                    ₹{PLANS[1].price}<span className="text-sm font-normal text-slate-500">/3 months</span>
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  {PRO_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${f.hot ? "bg-amber-500 text-slate-950 font-bold" : "bg-emerald-500 text-white"}`}>
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className={`text-slate-800 dark:text-slate-200 ${f.hot ? "font-bold text-slate-900 dark:text-white" : "font-medium"}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan("quarterly")}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              >
                Select Pro Plan
              </button>
            </div>

            {/* AI Mode Plan */}
            <div className="relative rounded-3xl border border-purple-500/40 bg-gradient-to-b from-[var(--card)] to-purple-500/5 p-6 shadow-xl shadow-purple-500/10 dark:from-[var(--surface)] dark:to-purple-500/10 flex flex-col justify-between">
              <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                AI Powered
              </div>
              <div>
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">The Complete AI Co-pilot</span>
                  <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
                    Zi AI Mode
                  </h3>
                  <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                    ₹{PLANS[3].price}<span className="text-sm font-normal text-slate-500">/month</span>
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  {AI_MODE_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${f.hot ? "bg-purple-600 text-white font-bold" : "bg-indigo-500 text-white"}`}>
                        <Sparkles className="h-2.5 w-2.5" />
                      </div>
                      <span className={`text-slate-800 dark:text-slate-200 ${f.hot ? "font-bold text-slate-900 dark:text-white" : "font-medium"}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan("ai_mode")}
                className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Select AI Mode
              </button>
            </div>
          </div>
        </section>

        {/* ── Value Proposition Bento Grid ── */}
        <section className="space-y-6 animate-slideUp" style={{ animationDelay: "200ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Built For High Scorers</span>
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white sm:text-3xl">
              Everything You Need to Boost Your Percentile
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENTO_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-[var(--card)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-[var(--border)] dark:bg-[var(--surface)]"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${card.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black font-display text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Social Proof & Trust Metrics ── */}
        <section className="animate-slideUp" style={{ animationDelay: "250ms" }}>
          <div className="grid grid-cols-3 gap-3 rounded-3xl border border-slate-200/80 bg-[var(--card)] p-4 text-center shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-6">
            <div className="space-y-1">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black font-display text-slate-900 dark:text-white sm:text-4xl">12,000+</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:text-xs">Active Aspirants</p>
            </div>

            <div className="space-y-1 border-x border-slate-200/70 dark:border-[var(--border)]">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black font-display text-slate-900 dark:text-white sm:text-4xl">94%</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:text-xs">Reported Higher Speed</p>
            </div>

            <div className="space-y-1">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black font-display text-slate-900 dark:text-white sm:text-4xl">3.2x</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:text-xs">Faster Mistake Mastery</p>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="mx-auto max-w-3xl space-y-6 animate-slideUp" style={{ animationDelay: "300ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Got Questions?</span>
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[var(--card)] shadow-sm transition-colors dark:border-[var(--border)] dark:bg-[var(--surface)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-slate-900 dark:text-white sm:p-5"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-500" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-xs leading-relaxed text-slate-600 dark:border-[var(--border)]/40 dark:text-slate-300 sm:px-5 sm:pb-5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Bottom Finale CTA Banner ── */}
        <section className="animate-slideUp" style={{ animationDelay: "350ms" }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 p-8 text-center shadow-2xl sm:p-12">
            <div className="relative z-10 mx-auto max-w-2xl space-y-4">
              <h2 className="text-3xl font-black font-display text-slate-950 sm:text-5xl tracking-tight leading-tight">
                Ready to Boost Your Rank?
              </h2>
              <p className="text-slate-950/80 text-sm font-medium sm:text-base">
                Join thousands of students mastering previous years questions and timed mock tests on PrepZii.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleSubscribe}
                  disabled={loading || isCurrentPlanSelected}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-sm font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900"
                >
                  <span>{currentPlan ? `Upgrade to ${plan.label} • ₹${plan.total}` : `Get ${selectedTrack} Pro • ₹${plan.total}`}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
