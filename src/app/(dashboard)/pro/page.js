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
  Stethoscope,
  CheckCircle2,
  TrendingUp,
  Sparkle,
  BookOpen,
  Layers,
  HelpCircle,
} from "lucide-react";

const FREE_FEATURES = [
  { text: "Full-paper & random PYQ practice", included: true },
  { text: "Daily Warmup exercises & formulas", included: true },
  { text: "2 custom tests per month", included: true },
  { text: "Global leaderboard & community", included: true },
  { text: "Chapter-wise PYQs & mistake redo", included: false },
  { text: "Unlimited custom test & mock generator", included: false },
  { text: "Advanced analytics & weak-spot alerts", included: false },
  { text: "AI-powered step-by-step explanations", included: false },
  { text: "100% Ad-free distraction-free UI", included: false },
];

const PRO_FEATURES = [
  { text: "Everything in Free plan", hot: false },
  { text: "Unlimited custom tests & mock generators", hot: true },
  { text: "Full-length timed exam mock tests", hot: true },
  { text: "15+ Years Chapter-wise authentic PYQs", hot: true },
  { text: "Automated Mistake Redo Deck", hot: true },
  { text: "Deep chapter analytics & accuracy trends", hot: true },
  { text: "Step-by-step AI question hints", hot: true },
  { text: "100% Ad-free & priority fast servers", hot: false },
];

const AI_MODE_FEATURES = [
  { text: "Everything in Pro plan", hot: false },
  { text: "Full Zi AI Voice & Visual Study Companion", hot: true },
  { text: "High-capacity AI usage & instant doubt solver", hot: true },
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
    highlight: "Flexible Month Pass",
    perMonthCalc: "₹49 / mo",
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
    highlight: "Best for Steady Prep",
    perMonthCalc: "₹43 / mo",
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
    highlight: "Full Academic Session",
    perMonthCalc: "₹33 / mo",
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
    savings: "Save ₹1,700",
    highlight: "Complete AI Co-pilot",
    perMonthCalc: "₹1,999 / mo",
  },
];

const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3, ai_mode: 4 };

const BENTO_CARDS = [
  {
    icon: Target,
    title: "Chapter-wise PYQ Mastery",
    tag: "High Yield",
    desc: "Target specific topics with 15+ years of authentic past paper questions, instant difficulty filters, and paper-wise breakdowns.",
  },
  {
    icon: RotateCcw,
    title: "Smart Mistake Redo Deck",
    tag: "Auto Spaced Repetition",
    desc: "Every wrong answer is automatically cataloged in your redo deck. Practice until concepts are completely mastered.",
  },
  {
    icon: BarChart2,
    title: "Precision Weak-Area Analytics",
    tag: "Deep Diagnostic",
    desc: "Visual topic breakdown charts pinpoint accuracy gaps, time spent per question, and high-frequency revision alerts.",
  },
  {
    icon: Brain,
    title: "Zi AI Study Co-pilot",
    tag: "Instant Doubts",
    desc: "Clear any complex Physics, Chemistry, Math, or Biology query with step-by-step interactive breakdowns and hints.",
  },
];

const FAQS = [
  {
    q: "Can I cancel or upgrade my pass anytime?",
    a: "PrepZii pass durations are fixed-term instant activation passes. You can upgrade to a longer tier anytime — new duration is added on top of your existing pass.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "We support UPI (GPay, PhonePe, Paytm), credit & debit cards, Net Banking, and major Indian wallets via secure 256-bit encrypted Razorpay checkout.",
  },
  {
    q: "Will my practice records and bookmarks stay safe if my pass expires?",
    a: "Yes, 100%! All your test attempt history, accuracy stats, bookmarks, and mistake redo logs are permanently preserved on your PrepZii account.",
  },
  {
    q: "What is the key difference between Pro and AI Mode?",
    a: "Pro unlocks unlimited mock testing, 15+ years chapter PYQs, mistake redo deck, and deep analytics. AI Mode includes all Pro benefits plus full Zi AI Voice & Visual study companion, personalized memory, and high-capacity prompt quota.",
  },
];

export default function ProPage() {
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [selectedTrack, setSelectedTrack] = useState("JEE");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
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

  const handleSubscribe = async (planId = selectedPlan) => {
    const targetPlan = planId || selectedPlan;
    setSelectedPlan(targetPlan);

    if (loading || (currentPlan && PLAN_RANK[targetPlan] <= PLAN_RANK[currentPlan])) return;

    try {
      setLoading(true);
      const order = await createOrder(targetPlan, selectedTrack);
      await openRazorpayCheckout(order);
    } catch (err) {
      alert(err.message || "Unable to start payment.");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlanSelected = Boolean(currentPlan && PLAN_RANK[plan.id] <= PLAN_RANK[currentPlan]);
  const isAiSelected = selectedPlan === "ai_mode";

  const getCtaLabel = (p = plan) => {
    if (isCurrentPlanSelected) return "Current Active Plan";
    if (currentPlan) return `Upgrade to ${p.label} Pass • ₹${p.total}`;
    if (p.id === "ai_mode") return `Unlock ${selectedTrack} AI Mode • ₹${p.total}`;
    return `Unlock ${selectedTrack} Pro • ₹${p.total}`;
  };

  return (
    <PageWrapper
      title=""
      badge="PREPZII PASS"
      badgeIcon={<Sparkles className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />}
      badgeVariant="brand"
    >
      <div className="relative mx-auto max-w-6xl space-y-12 sm:space-y-16 pb-20">

        {/* ── HERO SECTION ── */}
        <section className="space-y-6 text-center animate-slideUp">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-slate-900 dark:bg-white animate-pulse" />
            <span className="tracking-wide">Academic Pass for Serious Aspirants</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{selectedTrack}</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl leading-[1.08]">
              Master Every PYQ With <br className="hidden sm:inline" />
              <span className="relative inline-block text-slate-900 dark:text-white">
                Precision & Confidence
                <span className="absolute bottom-1 left-0 h-2 w-full bg-slate-200/80 dark:bg-slate-800/80 -z-10 rounded-sm" />
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg font-normal leading-relaxed">
              Unlimited timed exam mocks, 15+ years authentic chapter PYQs, automated mistake redo decks, and AI assistance tuned for{" "}
              <strong className="text-slate-900 dark:text-white font-bold">{selectedTrack}</strong>.
            </p>
          </div>

          {/* Exam Track Switcher */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Track:</span>
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setSelectedTrack("JEE")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedTrack === "JEE"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>JEE Track</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrack("NEET")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedTrack === "NEET"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>NEET Track</span>
              </button>
            </div>
          </div>
        </section>


        {/* ── PLAN DURATION SELECTOR & FEATURED HIGHLIGHT ── */}
        <section className="space-y-6 animate-slideUp" style={{ animationDelay: "100ms" }}>

          {/* Duration Selector Tabs */}
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 p-2 sm:grid-cols-4">
              {PLANS.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative flex min-h-[76px] flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-lg ring-1 ring-slate-400/50"
                        : "hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p.badge && (
                      <span
                        className={`absolute -top-2.5 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                          isSelected
                            ? "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-white"
                            : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                    <span className="text-xs font-extrabold">{p.label}</span>
                    <span className={`text-xs font-semibold ${isSelected ? "text-slate-300 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"}`}>
                      ₹{p.price}
                    </span>
                    <span className={`text-[10px] ${isSelected ? "text-slate-300 dark:text-slate-700" : "text-slate-400 dark:text-slate-500"}`}>
                      {p.perMonthCalc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Featured Pass Card */}
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900 dark:bg-white" />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
              
              {/* Left Column: Pricing Info */}
              <div className="space-y-4 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <span className="rounded-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-extrabold">
                    {selectedTrack} {plan.label} Pass
                  </span>
                  <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                    {plan.discount}% OFF
                  </span>
                  {plan.savings && (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-center gap-3 md:justify-start">
                  <span className="text-xl font-bold text-slate-400 line-through dark:text-slate-500 sm:text-2xl">
                    ₹{plan.originalPrice}
                  </span>
                  <span className="text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                    ₹{plan.price}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    /{plan.per}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {plan.highlight} • Instant activation across all devices
                </p>

                {/* Key Bullet Highlights */}
                <div className="space-y-2 pt-1 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-900 dark:text-white" />
                    <span>Instant access to 15+ years authentic chapter PYQs</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-900 dark:text-white" />
                    <span>Automated Spaced-Repetition Mistake Redo Deck</span>
                  </div>
                  {isAiSelected ? (
                    <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>Full Zi AI Voice, Visual & Memory Study Companion</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-900 dark:text-white" />
                      <span>Step-by-step AI question explanations & hints</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Primary CTA */}
              <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 border border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={() => handleSubscribe()}
                  disabled={loading || isCurrentPlanSelected}
                  className={`group w-full py-4 px-6 rounded-xl text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                    isCurrentPlanSelected
                      ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>{getCtaLabel()}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-1 text-center text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <Shield className="h-3.5 w-3.5" />
                    <span>256-Bit SSL Encrypted Razorpay Checkout</span>
                  </div>
                  <span>100% Ad-Free • Unlimited Mocks</span>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ── THREE-COLUMN COMPARISON CARDS ── */}
        <section className="space-y-6 animate-slideUp" style={{ animationDelay: "150ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Clear & Honest Comparison
            </span>
            <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white sm:text-3xl">
              Choose the Plan That Fits Your Preparation Goal
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* 1. Free Tier */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Basic Access</span>
                  <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">Free Tier</h3>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                    ₹0 <span className="text-xs font-normal text-slate-400">/ forever</span>
                  </p>
                </div>
                <div className="space-y-3 pt-4">
                  {FREE_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      {f.included ? (
                        <Check className="h-4 w-4 shrink-0 text-slate-900 dark:text-white mt-0.5 stroke-[2.5]" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-700 mt-0.5" />
                      )}
                      <span className={f.included ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-400 dark:text-slate-600 line-through"}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6">
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 text-xs font-bold cursor-default text-center"
                >
                  Active Default Plan
                </button>
              </div>
            </div>

            {/* 2. Pro Pass (Highlighted) */}
            <div className="relative rounded-2xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 p-6 shadow-lg flex flex-col justify-between">
              <div className="absolute -top-3 right-6 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Recommended
              </div>
              <div>
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full PYQ & Mock Access</span>
                  <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                    {selectedTrack} Pro Pass
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-400 line-through">₹{PLANS[1].originalPrice}</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      ₹{PLANS[1].price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ 3 months</span>
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                  {PRO_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      <Check className="h-4 w-4 shrink-0 text-slate-900 dark:text-white mt-0.5 stroke-[3]" />
                      <span className={`text-slate-800 dark:text-slate-200 ${f.hot ? "font-bold text-slate-900 dark:text-white" : "font-medium"}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleSubscribe("quarterly")}
                  disabled={loading || Boolean(currentPlan && PLAN_RANK["quarterly"] <= PLAN_RANK[currentPlan])}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-extrabold transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Get {selectedTrack} Pro • ₹{PLANS[1].total}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 3. AI Mode Pass */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full AI Companion</span>
                  <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">Zi AI Mode</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-400 line-through">₹{PLANS[3].originalPrice}</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      ₹{PLANS[3].price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ month</span>
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                  {AI_MODE_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      <Sparkles className="h-4 w-4 shrink-0 text-slate-900 dark:text-white mt-0.5" />
                      <span className={`text-slate-800 dark:text-slate-200 ${f.hot ? "font-bold text-slate-900 dark:text-white" : "font-medium"}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleSubscribe("ai_mode")}
                  disabled={loading || Boolean(currentPlan && PLAN_RANK["ai_mode"] <= PLAN_RANK[currentPlan])}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-extrabold transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Get AI Mode • ₹{PLANS[3].total}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </section>


        {/* ── BENTO GRID: KEY CAPABILITIES ── */}
        <section className="space-y-6 animate-slideUp" style={{ animationDelay: "200ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Engineered For Efficiency</span>
            <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white sm:text-3xl">
              Four Core Tools to Raise Your Percentile
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENTO_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                      {card.tag}
                    </span>
                    <h3 className="text-base font-extrabold font-display text-slate-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ── STATS & PROOF BAR ── */}
        <section className="animate-slideUp" style={{ animationDelay: "250ms" }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
            <div className="space-y-1 p-2">
              <p className="text-3xl font-extrabold font-display text-slate-900 dark:text-white sm:text-4xl">12,000+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Aspirants Practicing</p>
            </div>
            <div className="space-y-1 p-2 border-t sm:border-t-0 sm:border-x border-slate-100 dark:border-slate-800">
              <p className="text-3xl font-extrabold font-display text-slate-900 dark:text-white sm:text-4xl">94%</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reported Higher Exam Speed</p>
            </div>
            <div className="space-y-1 p-2 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <p className="text-3xl font-extrabold font-display text-slate-900 dark:text-white sm:text-4xl">3.2x</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Faster Mistake Mastery</p>
            </div>
          </div>
        </section>


        {/* ── FAQ ACCORDION ── */}
        <section className="mx-auto max-w-3xl space-y-6 animate-slideUp" style={{ animationDelay: "300ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">FAQ</span>
            <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
                    isOpen ? "border-slate-400 dark:border-slate-600 shadow-sm" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-slate-900 dark:text-white" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 dark:border-slate-800 px-4 pb-4 pt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>


        {/* ── BOTTOM FINALE CTA ── */}
        <section className="animate-slideUp" style={{ animationDelay: "350ms" }}>
          <div className="rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-8 sm:p-12 text-center shadow-xl border border-slate-800">
            <div className="mx-auto max-w-2xl space-y-4">
              <h2 className="text-3xl font-extrabold font-display sm:text-4xl tracking-tight">
                Ready to Boost Your Rank?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-normal">
                Join thousands of students practicing previous years questions and timed mock tests on PrepZii.
              </p>
              <div className="pt-3">
                <button
                  onClick={() => handleSubscribe()}
                  disabled={loading || isCurrentPlanSelected}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 px-8 py-3.5 text-xs font-extrabold shadow-md hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  <span>{getCtaLabel()}</span>
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
