"use client";

import { useState } from "react";
import { createOrder, openRazorpayCheckout } from "@/lib/payment";
import { Check, LockKeyhole } from "lucide-react";

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
}) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    if (loading) return;

    try {
      setLoading(true);

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
        popular
          ? "border-blue-600 bg-blue-50"
          : "border-gray-200 bg-[var(--card)]"
      }`}
    >
      {popular && (
        <span className="absolute right-6 top-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}

      <h3 className="text-2xl font-bold">{title}</h3>

      <div className="mt-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-400 line-through decoration-2">₹{originalPrice}</span>
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
            {discount}% off
          </span>
        </div>
        <span className="text-5xl font-black font-display">₹{price}</span>

        <span className="ml-2 text-gray-500">
          / {duration}
        </span>
        <p className="mt-2 text-sm font-semibold text-emerald-600">Limited-time discounted price</p>
      </div>

      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm"
          >
            <Check className="h-4 w-4 text-green-600" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl bg-blue-50 px-3 py-2 text-center text-sm font-bold text-[#1e3a5f]">
        {examTrack} Pro
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`mt-8 w-full rounded-xl py-3 font-semibold text-white transition ${
          loading
            ? "cursor-not-allowed bg-gray-400"
            : "bg-[#1e3a5f] hover:opacity-90"
        }`}
      >
        {loading ? "Processing..." : `Upgrade or renew ${examTrack} Pro`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        <span className="inline-flex items-center justify-center gap-1.5">
          <LockKeyhole className="h-3.5 w-3.5" />
          Secure payment powered by Razorpay
        </span>
      </p>
    </div>
  );
}
