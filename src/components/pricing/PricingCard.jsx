"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createOrder } from "@/lib/payment";

export default function PricingCard({
  title,
  price,
  duration,
  plan,
  features = [],
  popular = false,
}) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState("JEE");

  async function handlePayment() {
    if (loading) return;

    try {
      setLoading(true);

      const order = await createOrder(plan, selectedTrack);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "PrepZii",

        description: `${selectedTrack} ${title} Subscription`,

        order_id: order.id,

        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },

        notes: {
          plan,
          examTrack: selectedTrack,
        },

        theme: {
          color: "#1e3a5f",
        },

        handler: async function (response) {
          try {
            const verify = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...response,
                plan,
                examTrack: selectedTrack,
              }),
            });

            const result = await verify.json();

            if (result.success) {
              window.location.href = "/payment/success";
            } else {
              window.location.href = "/payment/failed";
            }
          } catch (err) {
            console.error(err);
            window.location.href = "/payment/failed";
          }
        },

        modal: {
          ondismiss() {
//             console.log("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Unable to start payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative rounded-3xl border p-8 shadow-sm transition hover:shadow-xl ${
        popular
          ? "border-blue-600 bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      {popular && (
        <span className="absolute right-6 top-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}

      <h3 className="text-2xl font-bold">{title}</h3>

      <div className="mt-5">
        <span className="text-5xl font-black">₹{price}</span>

        <span className="ml-2 text-gray-500">
          / {duration}
        </span>
      </div>

      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-green-600">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-1">
        {["JEE", "NEET"].map((track) => (
          <button
            key={track}
            type="button"
            onClick={() => setSelectedTrack(track)}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
              selectedTrack === track
                ? "bg-white text-[#1e3a5f] shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {track}
          </button>
        ))}
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
        {loading ? "Processing..." : `Upgrade to ${selectedTrack} Pro`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        🔒 Secure payment powered by Razorpay
      </p>
    </div>
  );
}
