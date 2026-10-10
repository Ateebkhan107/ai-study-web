"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createOrder, openRazorpayCheckout } from "@/lib/payment";
import PageWrapper from "@/components/PageWrapper";
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

const PRO_FEATURES = [
  { text: "Everything included in Free plan", hot: false },
  { text: "Unlimited custom tests & mock generators", hot: true },
  { text: "Full-length timed exam mock tests", hot: true },
  { text: "15+ Years Chapter-wise authentic PYQs", hot: true },
  { text: "Automated Mistake Redo Deck", hot: true },
  { text: "Deep chapter analytics & weak-spot alerts", hot: true },
  { text: "Step-by-step AI question hints", hot: true },
  { text: "100% Ad-free & priority fast servers", hot: false },
];

const AI_MODE_FEATURES = [
  { text: "Everything included in Pro plan", hot: false },
  { text: "Full Zi AI Voice & Visual Study Companion", hot: true },
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
    perMonthCalc: "₹49/mo",
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
    perMonthCalc: "₹43/mo",
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
    perMonthCalc: "₹33/mo",
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
    perMonthCalc: "₹1,999/mo",
  },
];

const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3, ai_mode: 4 };

const BENTO_CARDS = [
  {
    icon: Target,
    title: "Chapter PYQ Mastery",
    desc: "Target high-yield chapters with 15+ years of authentic PYQs and instant filters.",
  },
  {
    icon: RotateCcw,
    title: "Smart Mistake Redo",
    desc: "Wrong answers are saved automatically into your redo deck for spaced repetition.",
  },
  {
    icon: BarChart2,
    title: "Precision Analytics",
    desc: "Visual charts reveal accuracy trends, subject bottlenecks, and revision alerts.",
  },
  {
    icon: Brain,
    title: "Zi AI Doubt Solver",
    desc: "Ask any PYQ question and get instant step-by-step visual breakdowns.",
  },
];

const FAQS = [
  {
    q: "Can I upgrade or change my subscription anytime?",
    a: "Yes! You can upgrade anytime. New pass duration will be added directly to your account.",
  },
  {
    q: "Which payment methods are supported?",
    a: "We support UPI (GPay, PhonePe, Paytm), credit/debit cards, Net Banking, and wallets via Razorpay.",
  },
  {
    q: "Will my test data be saved if my plan expires?",
    a: "Yes, 100%! All your attempt history, accuracy stats, and bookmarks are permanently saved.",
  },
  {
    q: "What is the difference between Pro and AI Mode?",
    a: "Pro includes unlimited mocks, chapter PYQs, and mistake redo. AI Mode includes all Pro features plus full Zi AI Voice & Visual companion and higher prompt limits.",
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

  const getCtaLabel = (p = plan) => {
    if (isCurrentPlanSelected) return "Current Active Plan";
    if (currentPlan) return `Upgrade to ${p.label} • ₹${p.total}`;
    if (p.id === "ai_mode") return `Get ${selectedTrack} AI Mode • ₹${p.total}`;
    return `Get ${selectedTrack} Pro • ₹${p.total}`;
  };

  return (
    <PageWrapper
      title="Unlock PrepZii Pro"
      subtitle="Unlimited timed exam mocks, 15+ years authentic chapter PYQs, automated mistake redo, and instant AI doubt solving."
      badge="PREPZII PASS"
      badgeIcon={<Sparkles className="h-3.5 w-3.5" />}
      badgeVariant="brand"
    >
      <div className="space-y-8 sm:space-y-10">

        {/* ── Exam Track Selector ── */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Exam Track:</span>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedTrack("JEE")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedTrack === "JEE"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>JEE Main & Adv</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrack("NEET")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedTrack === "NEET"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>NEET UG</span>
            </button>
          </div>
        </div>

        {/* ── Plan Switcher Tabs ── */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 max-w-3xl">
          {PLANS.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={`relative flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                {p.badge && (
                  <span
                    className={`absolute -top-2.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      isSelected
                        ? "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    {p.badge}
                  </span>
                )}
                <span className="text-xs font-extrabold">{p.label}</span>
                <span className={`text-xs font-bold ${isSelected ? "text-slate-200 dark:text-slate-800" : "text-slate-500 dark:text-slate-400"}`}>
                  ₹{p.price}
                </span>
                <span className={`text-[10px] ${isSelected ? "text-slate-300 dark:text-slate-700" : "text-slate-400 dark:text-slate-500"}`}>
                  {p.perMonthCalc}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Main Featured Pricing Box ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm max-w-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {selectedTrack} {plan.label} Pass
                </span>
                <span className="rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-xs font-extrabold">
                  {plan.discount}% OFF
                </span>
                {plan.savings && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {plan.savings}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-400 line-through dark:text-slate-500">
                  ₹{plan.originalPrice}
                </span>
                <span className="text-4xl font-black font-display text-slate-900 dark:text-white">
                  ₹{plan.price}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  /{plan.per}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Instant access to 15+ years authentic chapter PYQs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Automated Mistake Redo Deck & Spaced Repetition</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Unlimited timed mock tests & diagnostic analytics</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubscribe()}
                disabled={loading || isCurrentPlanSelected}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-extrabold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{getCtaLabel()}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5" />
                <span>256-bit Encrypted Checkout via Razorpay</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3-Column Plan Cards ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-black font-display text-slate-900 dark:text-white">
            Plan Comparison
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Free Plan</h3>
                <p className="text-2xl font-black text-slate-400 dark:text-slate-500 mt-1">₹0</p>
                <div className="space-y-2.5 mt-4 text-xs">
                  {FREE_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2">
                      {f.included ? (
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 dark:text-slate-700 shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600 line-through"}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                disabled
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold cursor-default"
              >
                Current Default
              </button>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-slate-900 dark:border-white bg-white p-5 dark:bg-slate-900 flex flex-col justify-between relative shadow-sm">
              <span className="absolute -top-3 right-4 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                Recommended
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedTrack} Pro</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹129 <span className="text-xs font-normal text-slate-500">/3mo</span></p>
                <div className="space-y-2.5 mt-4 text-xs">
                  {PRO_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className={f.hot ? "font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}>
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
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                Get {selectedTrack} Pro
              </button>
            </div>

            {/* AI Mode */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">AI Mode</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹1,999 <span className="text-xs font-normal text-slate-500">/mo</span></p>
                <div className="space-y-2.5 mt-4 text-xs">
                  {AI_MODE_FEATURES.map((f) => (
                    <div key={f.text} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className={f.hot ? "font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}>
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
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                Get AI Mode
              </button>
            </div>
          </div>
        </div>

        {/* ── Feature Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENTO_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-900 dark:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{card.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* ── FAQ ── */}
        <div className="space-y-3 max-w-3xl">
          <h2 className="text-lg font-black font-display text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 text-left text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </PageWrapper>
  );
}
