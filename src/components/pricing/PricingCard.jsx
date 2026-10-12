"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createOrder, openRazorpayCheckout } from "@/lib/payment";
import { Check, LockKeyhole } from "lucide-react";
import AuthGateModal from "@/components/auth/AuthGateModal";
import posthog from "posthog-js";

export default function PricingCard({
  title,
  price,
  originalPrice,
  discount,
  duration,
  plan,
  features = [],
  popular = false,
  examTrack = "JEE",
  isAiMode = false,
}) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  async function handlePayment() {
    if (loading) return;

    if (!user) {
      setShowAuthGate(true);
      return;
    }

    try {
      setLoading(true);
      posthog.capture("checkout_started", {
        plan,
        exam_track: examTrack,
        duration,
        price,
        discount_percent: discount,
      });

      const order = await createOrder(plan, examTrack);

      await openRazorpayCheckout(order);
    } catch (error) {
      alert(error.message || "Unable to start payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative rounded-3xl border p-8 shadow-sm transition hover:shadow-xl ${
        isAiMode
          ? "border-amber-500/50 bg-[#fffcf3] dark:bg-[#0A0A0C] dark:border-amber-400/40 dark:shadow-[0_0_35px_-10px_rgba(234,179,8,0.2)]"
          : popular
          ? "border-blue-600 bg-blue-50 dark:bg-[#0A0A0C] dark:border-blue-500/40"
          : "border-gray-200 dark:border-white/20 bg-[var(--card)]"
      }`}
    >
      {isAiMode && (
        <span className="absolute right-6 top-6 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-slate-950 shadow-sm">
          Premium
        </span>
      )}
      {popular && !isAiMode && (
        <span className="absolute right-6 top-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}

      <h3 className="text-2xl font-bold">{title}</h3>

      <div className="mt-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-400 dark:text-slate-500 line-through decoration-2">₹{originalPrice}</span>
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
            {discount}% off
          </span>
        </div>
        <span className="text-5xl font-black font-display">{price ? `₹${price}` : ""}</span>

        <span className="ml-2 text-gray-500 dark:text-slate-400">
          / {duration}
        </span>
        <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Limited-time discounted price</p>
      </div>

      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl bg-blue-50 dark:bg-white/5 px-3 py-2 text-center text-sm font-bold text-[#1e3a5f] dark:text-amber-400">
        {isAiMode ? `${examTrack} AI Mode` : `${examTrack} Pro`}
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`mt-8 w-full rounded-xl py-3 font-black text-sm transition ${
          loading
            ? "cursor-not-allowed bg-gray-400"
            : isAiMode
            ? "bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 text-slate-950 shadow-md"
            : "bg-[#1e3a5f] hover:opacity-90 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white shadow-md"
        }`}
      >
        {loading ? "Processing..." : `Upgrade or renew ${isAiMode ? examTrack + " AI Mode" : examTrack + " Pro"}`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        <span className="inline-flex items-center justify-center gap-1.5">
          <LockKeyhole className="h-3.5 w-3.5" />
          Secure payment powered by Razorpay
        </span>
      </p>

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        targetUrl="/pricing"
        featureName={isAiMode ? `${examTrack} AI Mode` : `${examTrack} Pro`}
        title={`Sign in to upgrade to ${isAiMode ? examTrack + " AI Mode" : examTrack + " Pro"}`}
        message="Create your free account or sign in to complete your subscription and unlock full access."
      />
    </div>
  );
}
