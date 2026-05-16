"use client";

import { useState } from "react";

const FREE_FEATURES = [
  "20 questions per test",
  "Basic chapter-wise tests",
  "5 PYQ papers per month",
  "Basic performance stats",
  "Daily goals (3 goals)",
  "Formula cards (limited)",
];

const PRO_FEATURES = [
  { text: "Unlimited questions per test", hot: false },
  { text: "Full JEE & NEET mock tests", hot: true },
  { text: "All PYQ papers (2000–2024)", hot: true },
  { text: "Advanced analytics & weak area detection", hot: true },
  { text: "AI-powered personalised study plan", hot: true },
  { text: "Unlimited formula cards", hot: false },
  { text: "Detailed solution explanations", hot: false },
  { text: "Performance vs toppers comparison", hot: false },
  { text: "Priority support", hot: false },
  { text: "Early access to new features", hot: false },
];

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: 499,
    per: "month",
    total: null,
    badge: null,
    savings: null,
  },
  {
    id: "quarterly",
    label: "Quarterly",
    price: 399,
    per: "month",
    total: 1197,
    badge: "Popular",
    savings: "Save ₹300",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: 249,
    per: "month",
    total: 2988,
    badge: "Best Value",
    savings: "Save ₹3,000",
  },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription anytime from your profile. You'll retain PRO access until the end of your billing period.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "We accept UPI, all debit/credit cards, net banking, and wallets via Razorpay.",
  },
  {
    q: "Will my data be saved if I downgrade?",
    a: "Yes. All your test history, scores, and progress are saved forever regardless of plan.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes. You can upgrade or downgrade between plans at any time. The difference is prorated.",
  },
];

export default function ProPage() {
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);

  const plan = PLANS.find((p) => p.id === selectedPlan);

  const handleSubscribe = () => {
    setLoading(true);

    // TODO: call /api/payment/create-order → open Razorpay checkout

    setTimeout(() => {
      setLoading(false);

      alert(
        `Razorpay checkout opens here for ₹${
          plan.total || plan.price
        } ${selectedPlan} plan`
      );
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-[#1e3a5f] text-white uppercase tracking-widest">
          PRO
        </span>

        <h1 className="text-5xl font-black text-black dark:text-white tracking-tight leading-tight">
          Unlock your full
          <br />
          potential
        </h1>

        <p className="text-gray-400 text-base max-w-md mx-auto">
          Everything you need to crack JEE & NEET — unlimited tests,
          deep analytics, and AI-powered study plans.
        </p>
      </div>

      {/* ── Plan selector ──────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6">

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-2xl">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
                ${
                  selectedPlan === p.id
                    ? "bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
            >
              {p.label}

              {p.savings && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-green-500 text-white whitespace-nowrap">
                  {p.savings}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Price display */}
        <div className="text-center">
          <div className="flex items-end justify-center gap-1">
            <span className="text-2xl font-bold text-gray-400 mb-2">₹</span>

            <span className="text-7xl font-black text-black dark:text-white tracking-tight leading-none">
              {plan.price}
            </span>

            <span className="text-gray-400 text-base mb-2">
              /{plan.per}
            </span>
          </div>

          {plan.total && (
            <p className="text-sm text-gray-400 mt-1">
              Billed as{" "}
              <span className="font-semibold text-black dark:text-white">
                ₹{plan.total}
              </span>{" "}
              per{" "}
              {plan.id === "quarterly"
                ? "3 months"
                : "year"}
            </p>
          )}

          {plan.badge && (
            <span className="inline-block mt-2 text-[10px] font-black px-2.5 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black uppercase tracking-wide">
              {plan.badge}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full max-w-sm py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-base font-black hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading
            ? "Processing..."
            : `Start PRO — ₹${plan.price}/mo`}
        </button>

        <p className="text-xs text-gray-400">
          Cancel anytime · Secured by Razorpay
        </p>
      </div>

      {/* ── Free vs PRO comparison ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Free */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6">
          <div className="mb-5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Current plan
            </span>

            <h3 className="text-xl font-black text-black dark:text-white mt-1">
              Free
            </h3>

            <p className="text-3xl font-black text-gray-300 dark:text-gray-600 mt-1">
              ₹0
              <span className="text-base font-normal">/mo</span>
            </p>
          </div>

          <div className="space-y-3">
            {FREE_FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <span className="text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0">
                  ✕
                </span>

                <span className="text-sm text-gray-400">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRO */}
        <div className="bg-black dark:bg-white rounded-3xl p-6 relative overflow-hidden">

          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative">
            <div className="mb-5">
              <span className="text-xs font-bold text-white/50 dark:text-black/50 uppercase tracking-widest">
                Upgrade to
              </span>

              <h3 className="text-xl font-black text-white dark:text-black mt-1 flex items-center gap-2">
                PRO

                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/10 text-white/70 dark:text-black/70">
                  All features
                </span>
              </h3>

              <p className="text-3xl font-black text-white dark:text-black mt-1">
                ₹{plan.price}
                <span className="text-base font-normal text-white/60 dark:text-black/60">
                  /mo
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <div key={f.text} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex-shrink-0 text-sm ${
                      f.hot
                        ? "text-yellow-400"
                        : "text-white/60 dark:text-black/60"
                    }`}
                  >
                    {f.hot ? "★" : "✓"}
                  </span>

                  <span
                    className={`text-sm ${
                      f.hot
                        ? "text-white dark:text-black font-semibold"
                        : "text-white/70 dark:text-black/70"
                    }`}
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Social proof ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { value: "12,000+", label: "Active students" },
          { value: "94%", label: "Satisfaction rate" },
          { value: "3.2x", label: "Better results vs free" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5"
          >
            <p className="text-3xl font-black text-black dark:text-white tracking-tight">
              {s.value}
            </p>

            <p className="text-xs text-gray-400 mt-1 font-medium">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4 text-center">
          What toppers say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Priya S.",
              rank: "JEE Advanced AIR 342",
              text: "The AI study plan completely changed how I prepared. It found my weak spots in Thermodynamics within a week.",
            },
            {
              name: "Rohan M.",
              rank: "NEET 680/720",
              text: "The PYQ analysis and mock tests are insane. I could see exactly which chapters were costing me marks.",
            },
            {
              name: "Sneha K.",
              rank: "JEE Mains 99.2%ile",
              text: "Worth every rupee. The analytics showed me I was wasting time on easy questions I already knew.",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                "{t.text}"
              </p>

              <div>
                <p className="text-sm font-black text-black dark:text-white">
                  {t.name}
                </p>

                <p className="text-xs text-gray-400">
                  {t.rank}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4 text-center">
          Frequently asked questions
        </h2>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenFaq(openFaq === i ? null : i)
                }
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm font-semibold text-black dark:text-white">
                  {faq.q}
                </span>

                <span
                  className={`text-gray-400 text-xs transition-transform duration-200 flex-shrink-0 ml-4 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────── */}
      <div className="bg-black dark:bg-white rounded-3xl p-8 text-center relative overflow-hidden">

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative space-y-4">
          <h2 className="text-3xl font-black text-white dark:text-black tracking-tight">
            Ready to crack it?
          </h2>

          <p className="text-white/60 dark:text-black/60 text-sm">
            Join 12,000+ students already on PRO.
          </p>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-white dark:bg-black text-black dark:text-white text-sm font-black hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Processing..." : "Get PRO →"}
          </button>
        </div>
      </div>
    </div>
  );
}