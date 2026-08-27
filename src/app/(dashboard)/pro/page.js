"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createOrder, openCashfreeCheckout } from "@/lib/payment";
import PageWrapper from "@/components/PageWrapper";
import { Check, X, Star, Zap, Shield, Clock, Users, ArrowRight, ChevronDown } from "lucide-react";


const FREE_FEATURES = [
  { text: "Full-paper, random and saved PYQ practice", included: true },
  { text: "Daily Warmup", included: true },
  { text: "2 custom tests per month", included: true },
  { text: "Formula handbooks", included: true },
  { text: "Global leaderboard and community", included: true },
  { text: "Chapter-wise PYQs and mistake redo", included: false },
  { text: "Quick tests and premium full mock tests", included: false },
  { text: "Advanced and PYQ analytics", included: false },
  { text: "AI explanations", included: false },
  { text: "Ad-free experience", included: false },
];

const PRO_FEATURES = [
  { text: "Everything included in Free", hot: false },
  { text: "Unlimited custom tests", hot: true },
  { text: "Quick tests and premium full-length mock tests", hot: true },
  { text: "Chapter-wise PYQs and mistake redo", hot: true },
  { text: "PYQ analytics and revision insights", hot: true },
  { text: "Advanced analytics, trends and weak-area detection", hot: true },
  { text: "AI-powered question explanations", hot: false },
  { text: "Ad-free experience", hot: true },
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
  },
];

const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3 };

const FAQS = [
  {
    q: "Can I cancel my subscription?",
    a: "PrepZii subscriptions are fixed-term plans. They remain active until the end of the purchased billing period.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "We accept UPI, debit/credit cards, net banking, and supported wallets via Cashfree Payments.",
  },
  {
    q: "Will my data be saved if I downgrade?",
    a: "Yes. All your test history, scores, and progress are saved forever regardless of plan.",
  },
];

export default function ProPage() {
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [selectedTrack, setSelectedTrack] = useState("JEE");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const plan = PLANS.find((p) => p.id === selectedPlan);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileTrack() {
      if (!user) return;

      const profileResponse = await fetch("/api/profile", { cache: "no-store" });
      if (!profileResponse.ok) return;
      const profile = await profileResponse.json();
      const profileTrack = profile?.exam === "NEET" ? "NEET" : "JEE";
      const subscriptionResponse = await fetch(`/api/subscription?examTrack=${profileTrack}`, { cache: "no-store" });
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
    return () => { cancelled = true; };
  }, [user]);

  const handleSubscribe = async () => {
    if (loading || (currentPlan && PLAN_RANK[selectedPlan] <= PLAN_RANK[currentPlan])) return;

    try {
      setLoading(true);

      const order = await createOrder(selectedPlan, selectedTrack);

      await openCashfreeCheckout(order);
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to start payment.");
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title=""
      badge="PRO"
      badgeIcon={<Star className="h-3.5 w-3.5" />}
      badgeVariant="brand"
    >
      {/* ── Hero ── */}
      <section className="space-y-4 text-center animate-slideUp sm:space-y-5">
        <h1 className="text-3xl font-black leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          Unlock your full
          <br />
          <span className="bg-gradient-to-r from-indigo-500 via-brand-hover to-pink-500 bg-clip-text text-transparent">
            potential
          </span>
        </h1>

        <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-400 dark:text-slate-500 sm:text-base">
          {selectedTrack} Pro unlocks only {selectedTrack} content. Renew or upgrade anytime to extend your access.
        </p>
      </section>

      <section className="flex justify-center animate-slideUp" style={{ animationDelay: "50ms" }}>
        <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-black text-indigo-600 dark:text-indigo-300 sm:px-6 sm:py-3">
          {selectedTrack} Pro
        </div>
      </section>

      {/* ── Plan Selector ── */}
      <section className="flex flex-col items-center gap-5 animate-slideUp sm:gap-8" style={{ animationDelay: "75ms" }}>
        {/* Toggle */}
        <div className="grid w-full max-w-md grid-cols-3 items-stretch gap-1 rounded-2xl border border-slate-200/60 bg-[var(--card)]/70 p-1.5 backdrop-blur-xl dark:border-[var(--border)]/50 dark:bg-[var(--surface)]/60 sm:inline-flex sm:w-auto">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              disabled={Boolean(currentPlan && PLAN_RANK[p.id] <= PLAN_RANK[currentPlan])}
              className={`relative flex min-h-12 flex-col items-center justify-center rounded-xl px-2 py-2 text-xs font-bold transition-all duration-200 sm:min-h-14 sm:px-4 sm:text-sm
                ${
                  selectedPlan === p.id
                    ? "bg-amber-500 dark:bg-amber-600 text-white shadow-sm"
                    : currentPlan && PLAN_RANK[p.id] <= PLAN_RANK[currentPlan]
                      ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
                      : "cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
            >
              {p.label}
              {currentPlan === p.id && (
                <span className="mt-0.5 whitespace-nowrap text-[8px] font-black uppercase tracking-wider text-indigo-500">
                  Current plan
                </span>
              )}
              {p.savings && (
                <span className="mt-0.5 whitespace-nowrap rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[8px] font-black text-white shadow-sm shadow-emerald-500/20">
                  {p.savings}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Price display */}
        <div className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-slate-400 line-through decoration-2 dark:text-slate-600 sm:text-xl">
              ₹{plan.originalPrice}
            </span>
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm shadow-emerald-500/20">
              {plan.discount}% off
            </span>
          </div>
          <div className="flex items-end justify-center gap-1">
            <span className="mb-1 text-xl font-bold text-slate-400 dark:text-slate-500 sm:mb-2 sm:text-2xl">₹</span>
            <span className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-6xl font-black leading-none tracking-tighter text-transparent dark:from-white dark:to-slate-300 sm:text-8xl">
              {plan.price}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-base mb-2">/{plan.per}</span>
          </div>

          <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Limited-time discounted price
          </p>

          {plan.badge && (
            <span className="inline-block mt-3 text-[10px] font-black px-3 py-1 rounded-full bg-amber-500 text-white uppercase tracking-widest shadow-sm shadow-amber-500/20">
              {plan.badge}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading || currentPlan === "yearly"}
          className="group w-full max-w-sm py-4 rounded-2xl bg-amber-500 text-white text-base font-black hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/25 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {currentPlan ? `Upgrade to ${plan.label} • ₹${plan.total}` : `Get ${selectedTrack} Pro • ₹${plan.total}`}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </button>

        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Shield className="w-3 h-3" />
          Secure payment powered by Cashfree Payments
        </p>
      </section>

      {/* ── Free vs PRO Comparison ── */}
      <section className="animate-slideUp" style={{ animationDelay: "150ms" }}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Free Plan */}
          <div className="glass-card p-4 sm:p-6">
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Free plan
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Free
              </h3>
              <p className="text-3xl font-black text-slate-300 dark:text-slate-600 mt-1">
                ₹0<span className="text-base font-normal">/mo</span>
              </p>
            </div>

            <div className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <div key={f.text} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-[var(--surface-elevated)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {f.included ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <X className="w-3 h-3 text-rose-400" />
                    )}
                  </div>
                  <span className={`text-sm ${f.included ? "text-slate-500 dark:text-slate-400" : "text-slate-400 line-through dark:text-slate-600"}`}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PRO Plan */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 p-4 shadow-xl shadow-amber-500/15 dark:from-amber-500 dark:to-amber-700 sm:p-6">
            {/* Dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" />

            <div className="relative">
              <div className="mb-5">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                  Pro includes
                </span>
                <h3 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                  {selectedTrack} PRO
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--card)]/15 text-white/80 backdrop-blur-sm">
                    All features
                  </span>
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-white/45 line-through decoration-2">₹{plan.originalPrice}</span>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-200">
                    {plan.discount}% off
                  </span>
                </div>
                <p className="text-3xl font-black text-white mt-1">
                  ₹{plan.price}
                  <span className="text-base font-normal text-white/50">
                    /{plan.per}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                {PRO_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      f.hot ? "bg-amber-400/20" : "bg-[var(--card)]/10"
                    }`}>
                      {f.hot ? (
                        <Star className="w-3 h-3 text-amber-300" fill="currentColor" />
                      ) : (
                        <Check className="w-3 h-3 text-white/60" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      f.hot ? "text-white font-semibold" : "text-white/70"
                    }`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="animate-slideUp" style={{ animationDelay: "225ms" }}>
        <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
          {[
            { value: "12,000+", label: "Active students", icon: Users },
            { value: "94%", label: "Satisfaction rate", icon: Zap },
            { value: "3.2x", label: "Better results vs free", icon: Star },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card p-3 transition-all duration-300 hover:-translate-y-1 sm:p-5 group"
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 transition-transform duration-300 group-hover:scale-110 dark:border-indigo-500/20 dark:bg-indigo-500/10 sm:mb-3 sm:h-10 sm:w-10">
                <s.icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400 sm:h-5 sm:w-5" />
              </div>
              <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-[10px] font-medium leading-tight text-slate-400 dark:text-slate-500 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="animate-slideUp" style={{ animationDelay: "300ms" }}>
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-5 text-center">
          Frequently asked questions
        </h2>

        <div className="space-y-2 max-w-2xl mx-auto">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 dark:hover:bg-[var(--card)]/5 transition-colors cursor-pointer"
              >
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100/50 dark:border-[var(--border-subtle)]/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="animate-slideUp" style={{ animationDelay: "375ms" }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 p-5 text-center shadow-xl shadow-amber-500/15 dark:from-amber-500 dark:to-amber-700 sm:p-10">
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-5">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              Ready to crack it?
            </h2>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              Join 12,000+ students already on PRO. Start your exam prep with the best tools.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loading || currentPlan === "yearly"}
              className="group inline-flex max-w-full items-center justify-center gap-2 rounded-2xl bg-[var(--card)] px-5 py-3 text-sm font-black text-indigo-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/20 disabled:opacity-50 sm:px-8 sm:py-3.5"
            >
              {loading ? "Processing..." : currentPlan === "yearly" ? "Yearly plan active" : currentPlan ? `Upgrade to ${plan.label} • ₹${plan.total}` : `Get ${selectedTrack} Pro • ₹${plan.total}`}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
