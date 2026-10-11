"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createOrder, openRazorpayCheckout } from "@/lib/payment";
import PageWrapper from "@/components/PageWrapper";
import AuthGateModal from "@/components/auth/AuthGateModal";
import {
  Check,
  X,
  Zap,
  Shield,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Brain,
  Target,
  RotateCcw,
  BarChart2,
  Stethoscope,
  CheckCircle2,
  Award,
  Users,
} from "lucide-react";

const FREE_FEATURES = [
  { text: "Full-paper & random PYQ practice", included: true },
  { text: "Daily Warmup exercises & formulas", included: true },
  { text: "2 custom tests per month", included: true },
  { text: "Global leaderboard & community", included: true },
  { text: "Chapter-wise PYQs & mistake redo", included: false },
  { text: "Unlimited custom test & mock generator", included: false },
  { text: "Advanced PYQ analytics & insights", included: false },
  { text: "AI-powered step-by-step explanations", included: false },
  { text: "100% Ad-free experience", included: false },
];

const getProFeatures = (track) => [
  { text: "Everything included in Free plan", hot: false },
  { text: `Unlimited custom tests & ${track} mock generators`, hot: true },
  { text: `Full-length timed ${track} exam mock tests`, hot: true },
  { text: `15+ Years Chapter-wise authentic ${track} PYQs`, hot: true },
  { text: "Automated Mistake Redo Deck", hot: true },
  { text: `Deep ${track} chapter analytics & weak-spot alerts`, hot: true },
  { text: "Step-by-step AI question hints & explanations", hot: true },
  { text: "100% Ad-free & priority fast servers", hot: false },
];

const getAiFeatures = (track) => [
  { text: `Everything included in ${track} Pro plan`, hot: false },
  { text: `Full Zi AI Voice & Visual Companion for ${track}`, hot: true },
  { text: "High-capacity AI usage & instant doubt solving", hot: true },
  { text: "Personalized study memory & weak-area tracking", hot: true },
  { text: `Autonomous daily & weekly ${track} AI study plans`, hot: true },
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
    badge: "MOST POPULAR",
    savings: "Save ₹370",
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
    badge: "BEST VALUE",
    savings: "Save ₹1,400",
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
    badge: "PREMIUM AI",
    savings: "Save ₹1,700",
    perMonthCalc: "₹1,999 / mo",
  },
];

const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3, ai_mode: 4 };

const getBentoCards = (track, isSignedOut = false) => [
  {
    icon: Target,
    title: isSignedOut ? "Chapter-wise JEE & NEET PYQ Mastery" : `Chapter-wise ${track} PYQ Mastery`,
    desc: isSignedOut
      ? "Target high-yield chapters with 15+ years of authentic JEE and NEET PYQs, instant difficulty filters, and paper-wise breakdowns."
      : `Target high-yield chapters with 15+ years of authentic ${track} PYQs, instant difficulty filters, and paper-wise breakdowns.`,
  },
  {
    icon: RotateCcw,
    title: "Smart Mistake Redo Deck",
    desc: "Every wrong answer is automatically cataloged in your redo deck. Practice until concepts are completely mastered.",
  },
  {
    icon: BarChart2,
    title: "Precision Weak-Area Analytics",
    desc: "Visual topic breakdown charts pinpoint accuracy gaps, time spent per question, and high-frequency revision alerts.",
  },
  {
    icon: Brain,
    title: "Zi AI Instant Doubt Solver",
    desc: isSignedOut
      ? "Ask any conceptual JEE or NEET PYQ question and get instant step-by-step voice and visual problem breakdowns."
      : `Ask any conceptual ${track} PYQ question and get instant step-by-step voice and visual problem breakdowns.`,
  },
];

const FAQS = [
  {
    q: "Can I cancel or upgrade my subscription anytime?",
    a: "PrepZii passes are fixed-duration instant activation passes. You can upgrade to a higher tier anytime, and new duration will be added immediately to your existing pass.",
  },
  {
    q: "Which payment methods are supported?",
    a: "We support UPI (GPay, PhonePe, Paytm), credit/debit cards, Net Banking, and major Indian wallets via secure 256-bit encrypted Razorpay checkout.",
  },
  {
    q: "Will my practice progress and test data be saved if my plan expires?",
    a: "Yes, 100%! All your test attempts, accuracy records, bookmarks, and mistake redo lists are permanently preserved on your account.",
  },
  {
    q: "What is the key difference between Pro and AI Mode?",
    a: "Pro includes all unlimited mock testing, 15+ years chapter PYQs, mistake redo deck, and deep analytics. AI Mode includes all Pro features plus full Zi AI Voice & Visual companion and higher prompt limits.",
  },
];

function getInitialTrack() {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )prepzii_track=([^;]+)"));
    const savedTrack = match ? match[2].toUpperCase() : null;
    if (savedTrack === "NEET" || savedTrack === "JEE") return savedTrack;
  }
  return "JEE";
}

export default function ProPage() {
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [selectedTrack, setSelectedTrack] = useState(getInitialTrack);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { user } = useUser();

  const isSignedOut = !user;
  const router = useRouter();
  const plan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];
  const proFeatures = getProFeatures(selectedTrack);
  const aiFeatures = getAiFeatures(selectedTrack);
  const bentoCards = getBentoCards(selectedTrack, isSignedOut);

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

  const handleTrackChange = (newTrack) => {
    setSelectedTrack(newTrack);
    if (typeof document !== "undefined") {
      document.cookie = `prepzii_track=${newTrack.toLowerCase()}; path=/; max-age=31536000; SameSite=Lax;`;
    }
  };

  const handleSubscribe = async (planId = selectedPlan) => {
    const targetPlan = planId || selectedPlan;
    setSelectedPlan(targetPlan);

    if (!user) {
      setShowAuthGate(true);
      return;
    }

    if (loading || (currentPlan && PLAN_RANK[targetPlan] <= PLAN_RANK[currentPlan])) return;

    try {
      setLoading(true);
      const order = await createOrder(targetPlan, selectedTrack);
      await openRazorpayCheckout(order);
    } catch (err) {
      if (err?.message && !err.message.includes("cancelled")) {
        alert(err.message || "Unable to start payment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlanSelected = Boolean(currentPlan && PLAN_RANK[plan.id] <= PLAN_RANK[currentPlan]);

  const getCtaLabel = (p = plan) => {
    if (isCurrentPlanSelected) return "Current Active Plan";
    if (currentPlan) return `Upgrade to ${selectedTrack} ${p.label} • ₹${p.total}`;
    if (p.id === "ai_mode") return `Get ${selectedTrack} AI Mode • ₹${p.total}`;
    return `Get ${selectedTrack} Pro • ₹${p.total}`;
  };

  return (
    <PageWrapper
      title=""
      badge="PREPZII PASS"
      badgeIcon={<Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
      badgeVariant="brand"
    >
      <div className="relative mx-auto max-w-6xl space-y-10 sm:space-y-14 pb-20">

        {/* ── Hero Section ── */}
        <section className="space-y-6 text-center animate-slideUp">
          {/* Top Pill Badge matching PrepZii Dark Mode */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 dark:border-amber-400/30 dark:bg-amber-400/10 px-4 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="tracking-wide font-extrabold">Academic Intelligence Pass</span>
            <span className="text-amber-400">•</span>
            <span className="text-amber-700 dark:text-amber-300 font-extrabold uppercase tracking-wider">
              {isSignedOut ? "JEE & NEET Tracks" : selectedTrack === "NEET" ? "NEET Track" : "JEE Track"}
            </span>
          </div>

          {/* Main Title matching PrepZii typography */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl leading-[1.08]">
              {isSignedOut ? (
                <>
                  Master Every JEE & NEET PYQ With <br />
                  <span className="text-amber-500 dark:text-amber-400 font-black">
                    Precision & Confidence
                  </span>
                </>
              ) : (
                <>
                  Master Every {selectedTrack} PYQ With <br />
                  <span className="text-amber-500 dark:text-amber-400 font-black">
                    Precision & Confidence
                  </span>
                </>
              )}
            </h1>
            <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg font-medium leading-relaxed pt-2">
              Unlimited timed exam mocks, 15+ years authentic chapter PYQs, automated mistake redo decks, and AI assistance tuned for{" "}
              <strong className="text-amber-600 dark:text-amber-400 font-black underline decoration-amber-500 decoration-2 underline-offset-4">
                {isSignedOut ? "JEE & NEET Tracks" : selectedTrack === "NEET" ? "NEET Track" : "JEE Track"}
              </strong>.
            </p>
          </div>

          {/* Track Badge / Switcher */}
          <div className="pt-1">
            {isSignedOut ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Exam Track:
                </span>
                <div className="inline-flex items-center p-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-[#141415] shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleTrackChange("JEE")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      selectedTrack === "JEE"
                        ? "bg-amber-500 text-slate-950 dark:bg-amber-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    JEE Track
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTrackChange("NEET")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      selectedTrack === "NEET"
                        ? "bg-amber-500 text-slate-950 dark:bg-amber-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    NEET Track
                  </button>
                </div>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-500/30 dark:border-amber-400/20 bg-amber-500/10 dark:bg-amber-400/10 text-xs font-black text-amber-600 dark:text-amber-400 shadow-sm">
                <Zap className="h-3.5 w-3.5 fill-current" />
                {selectedTrack === "NEET" ? "NEET Track" : "JEE Track"}
              </span>
            )}
          </div>
        </section>

        {/* ── Interactive Pricing & Plan Selector ── */}
        <section className="space-y-6 animate-slideUp" style={{ animationDelay: "100ms" }}>
          {/* Plan Selector Buttons Bar */}
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-2.5 dark:border-white/10 dark:bg-[#141415] sm:grid-cols-4 shadow-sm">
              {PLANS.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative flex min-h-[78px] flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950 font-black shadow-lg ring-2 ring-amber-400/50"
                        : "hover:bg-white dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p.badge && (
                      <span
                        className={`absolute -top-3 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${
                          isSelected
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                            : "bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950"
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}

                    <span className="text-xs font-black sm:text-sm">{p.label}</span>
                    <span className={`text-xs font-bold ${isSelected ? "text-slate-950" : "text-slate-500 dark:text-slate-400"}`}>
                      ₹{p.price}
                    </span>
                    <span className={`text-[10px] font-medium ${isSelected ? "text-slate-900" : "text-slate-400 dark:text-slate-500"}`}>
                      {p.perMonthCalc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Featured Pricing Box */}
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-800/80 dark:border-white/10 bg-[#141415] text-white p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
              {/* Left Column: Details & Price */}
              <div className="space-y-4 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <span className="rounded-full bg-amber-500 dark:bg-amber-400 text-slate-950 px-3.5 py-1 text-xs font-black">
                    {selectedTrack} {plan.label} Pass
                  </span>
                  <span className="rounded-full bg-emerald-500 text-white px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm">
                    {plan.discount}% OFF
                  </span>
                  {plan.savings && (
                    <span className="rounded-full bg-slate-800 dark:bg-slate-800/80 text-slate-200 px-3 py-1 text-[11px] font-bold border border-slate-700 dark:border-slate-700">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-center gap-2.5 md:justify-start">
                  <span className="text-xl font-bold text-slate-400 line-through sm:text-2xl">
                    ₹{plan.originalPrice}
                  </span>
                  <span className="text-5xl font-black font-display tracking-tight text-white sm:text-6xl">
                    ₹{plan.price}
                  </span>
                  <span className="text-sm font-bold text-slate-400">
                    /{plan.per}
                  </span>
                </div>

                <p className="text-xs font-bold text-amber-400">
                  ⚡ Limited-time discounted {selectedTrack} academic pass active
                </p>

                {/* Instant Highlights */}
                <div className="space-y-2.5 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Instant access to 15+ years {selectedTrack} chapter PYQs & tests</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Automated Mistake Redo Deck & Spaced Repetition</span>
                  </div>
                  {selectedPlan === "ai_mode" ? (
                    <div className="flex items-center gap-2.5 text-amber-300 font-bold">
                      <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                      <span>Full Zi AI Voice, Visual & Memory Companion for {selectedTrack}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                      <span>Step-by-step AI question hints & explanations for {selectedTrack}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: CTA & Trust */}
              <div className="flex flex-col items-center justify-center space-y-3.5">
                <button
                  onClick={() => handleSubscribe()}
                  disabled={loading || isCurrentPlanSelected}
                  className={`group w-full py-4 px-6 rounded-2xl text-base font-black transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl cursor-pointer ${
                    isCurrentPlanSelected
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 text-slate-950 font-black active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <span>Securing Order...</span>
                  ) : (
                    <>
                      <span>{getCtaLabel()}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-1.5 text-center text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <Shield className="h-3.5 w-3.5" />
                    <span>256-Bit SSL Encrypted Razorpay Checkout</span>
                  </div>
                  <span>Instant activation • Works on Mobile & Desktop</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Comparison Matrix ── */}
        <section className="space-y-6 animate-slideUp" style={{ animationDelay: "150ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Transparent Pricing
            </span>
            <h2 className="text-2xl font-black font-display text-slate-950 dark:text-white sm:text-3xl">
              Compare Plans & Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#141415] flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Free Tier</span>
                  <h3 className="text-2xl font-black font-display text-slate-950 dark:text-white">Basic</h3>
                  <p className="mt-1 text-3xl font-black text-slate-400 dark:text-slate-500">
                    ₹0<span className="text-sm font-normal">/forever</span>
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  {FREE_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      {f.included ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5 stroke-[3]" />
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
              <button
                disabled
                className="mt-6 w-full py-3 rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold cursor-default text-center"
              >
                Current Default
              </button>
            </div>

            {/* PRO Plan */}
            <div className="relative rounded-3xl border border-amber-500/30 dark:border-amber-500/20 bg-white dark:bg-[#141415] p-6 shadow-md transition-all duration-200 hover:border-amber-500/50 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Unlimited {selectedTrack} Prep</span>
                  <h3 className="text-2xl font-black font-display text-slate-950 dark:text-white">
                    {selectedTrack} PRO
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-400 line-through">₹{PLANS[1].originalPrice}</span>
                    <span className="text-3xl font-black text-slate-950 dark:text-white">
                      ₹{PLANS[1].price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/3 months</span>
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white">
                      {PLANS[1].discount}% OFF
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {proFeatures.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${f.hot ? "bg-amber-500 text-slate-950 font-bold" : "bg-emerald-500 text-white"}`}>
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className={`text-slate-800 dark:text-slate-200 ${f.hot ? "font-bold text-slate-950 dark:text-white" : "font-medium"}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSubscribe("quarterly")}
                disabled={loading || Boolean(currentPlan && PLAN_RANK["quarterly"] <= PLAN_RANK[currentPlan])}
                className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 text-slate-950 font-black text-xs transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Get {selectedTrack} Pro • ₹{PLANS[1].total}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* AI Mode Plan */}
            <div className="relative rounded-3xl border border-amber-500/30 dark:border-amber-500/20 bg-white dark:bg-[#141415] p-6 shadow-md transition-all duration-200 hover:border-amber-500/50 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Complete {selectedTrack} AI Co-pilot</span>
                  <h3 className="text-2xl font-black font-display text-slate-950 dark:text-white">
                    {selectedTrack} AI Mode
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-400 line-through">₹{PLANS[3].originalPrice}</span>
                    <span className="text-3xl font-black text-slate-950 dark:text-white">
                      ₹{PLANS[3].price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/month</span>
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white">
                      {PLANS[3].discount}% OFF
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {aiFeatures.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-xs">
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${f.hot ? "bg-amber-500 text-slate-950 font-bold" : "bg-emerald-500 text-white"}`}>
                        <Sparkles className="h-2.5 w-2.5" />
                      </div>
                      <span className={`text-slate-800 dark:text-slate-200 ${f.hot ? "font-bold text-slate-950 dark:text-white" : "font-medium"}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSubscribe("ai_mode")}
                disabled={loading || Boolean(currentPlan && PLAN_RANK["ai_mode"] <= PLAN_RANK[currentPlan])}
                className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 text-slate-950 font-black text-xs transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Get {selectedTrack} AI Mode • ₹{PLANS[3].total}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Value Proposition Bento Grid ── */}
        <section className="space-y-6 animate-slideUp" style={{ animationDelay: "200ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Built For High Scorers</span>
            <h2 className="text-2xl font-black font-display text-slate-950 dark:text-white sm:text-3xl">
              Everything You Need to Boost Your Percentile
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bentoCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#141415]"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black font-display text-slate-950 dark:text-white">
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
          <div className="grid grid-cols-3 gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-[#141415] sm:p-6">
            <div className="space-y-1">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black font-display text-slate-950 dark:text-white sm:text-4xl">12,000+</p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">
                Active {isSignedOut ? "JEE & NEET" : selectedTrack} Aspirants
              </p>
            </div>

            <div className="space-y-1 border-x border-slate-200 dark:border-white/10">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <p className="text-2xl font-black font-display text-slate-950 dark:text-white sm:text-4xl">94%</p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">Reported Higher Speed</p>
            </div>

            <div className="space-y-1">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black font-display text-slate-950 dark:text-white sm:text-4xl">3.2x</p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">Faster Mistake Mastery</p>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="mx-auto max-w-3xl space-y-6 animate-slideUp" style={{ animationDelay: "300ms" }}>
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Got Questions?</span>
            <h2 className="text-2xl font-black font-display text-slate-950 dark:text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 bg-white dark:bg-[#141415] ${
                    isOpen ? "border-amber-500/60 dark:border-amber-400/60 shadow-sm" : "border-slate-200 dark:border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-slate-950 dark:text-white sm:p-5 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-500 dark:text-amber-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 dark:border-white/10 px-4 pb-4 pt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:px-5 sm:pb-5">
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
          <div className="relative overflow-hidden rounded-3xl bg-[#141415] text-white p-8 text-center shadow-2xl sm:p-12 border border-slate-800/80 dark:border-white/10">
            <div className="relative z-10 mx-auto max-w-2xl space-y-5">
              <h2 className="text-3xl font-black font-display text-white sm:text-5xl tracking-tight leading-tight">
                Ready to Boost Your {isSignedOut ? "JEE or NEET" : selectedTrack} Rank?
              </h2>
              <p className="text-slate-300 dark:text-slate-400 text-sm font-semibold sm:text-base">
                Join thousands of {isSignedOut ? "JEE and NEET" : selectedTrack} aspirants mastering previous years questions and timed mock tests on PrepZii.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleSubscribe()}
                  disabled={loading || isCurrentPlanSelected}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 px-8 py-4 text-sm font-black text-slate-950 shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  <span>{getCtaLabel()}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        targetUrl="/pro"
        featureName={`${selectedTrack} Pro Pass`}
        title={`Sign in to get ${selectedTrack} Pro`}
        message={`Create your free account or sign in to complete your subscription and unlock full access to ${selectedTrack} Pro.`}
      />
    </PageWrapper>
  );
}
