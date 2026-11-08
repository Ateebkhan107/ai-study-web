"use client";

import { useState } from "react";
import { CheckCircle2, Gift, Loader2, X } from "lucide-react";
import { DIWALI_PROMOTION, normalizeCouponCode } from "@/lib/diwaliPromotion";

export default function DiwaliCouponCheckout({ isOpen, examTrack, onClose, onPaidCheckout, onRedeemed }) {
  const [couponCode, setCouponCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  if (!isOpen) return null;

  function closeCheckout() {
    setCouponCode("");
    setStatus("idle");
    setMessage("");
    setCouponApplied(false);
    onClose?.();
  }

  function applyCoupon() {
    if (normalizeCouponCode(couponCode) !== DIWALI_PROMOTION.code) {
      setStatus("error");
      setCouponApplied(false);
      setMessage("Enter a valid coupon code.");
      return;
    }
    setStatus("applied");
    setCouponApplied(true);
    setMessage("Coupon applied — your total is ₹0.");
  }

  async function redeemCoupon() {
    try {
      setStatus("loading");
      setMessage("");
      const response = await fetch("/api/promotions/diwali/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode, plan: "quarterly", examTrack }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to activate the offer.");
      setStatus("success");
      setMessage(result.message);
      window.setTimeout(() => onRedeemed?.(result), 900);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to activate the offer.");
    }
  }

  async function continueToPayment() {
    try {
      setStatus("loading");
      setMessage("");
      await onPaidCheckout?.();
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to open payment checkout.");
    } finally {
      setStatus((current) => (current === "loading" ? "idle" : current));
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="diwali-checkout-title">
      <div className="relative w-full max-w-md rounded-3xl border border-amber-400/30 bg-white p-6 text-slate-950 shadow-2xl dark:bg-[#0A0A0C] dark:text-white">
        <button type="button" onClick={closeCheckout} disabled={status === "loading"} className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close checkout">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <span className="rounded-2xl bg-amber-400/20 p-3 text-amber-600 dark:text-amber-400"><Gift className="h-6 w-6" /></span>
          <div>
            <h2 id="diwali-checkout-title" className="text-xl font-black">Quarterly Pass checkout</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{examTrack} Pro · 3 months</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/5">
          <div className="flex justify-between"><span>Quarterly Pass</span><span>₹129</span></div>
          {couponApplied || status === "success" ? <div className="flex justify-between font-bold text-emerald-600"><span>DIWALIPREPZII</span><span>−₹129</span></div> : null}
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black dark:border-white/10"><span>Total</span><span>{couponApplied || status === "success" ? "₹0" : "₹129"}</span></div>
        </div>

        <label className="mt-5 block text-sm font-bold" htmlFor="diwali-coupon">Coupon code</label>
        <div className="mt-2 flex gap-2">
          <input id="diwali-coupon" value={couponCode} onChange={(event) => { setCouponCode(event.target.value); setStatus("idle"); setMessage(""); setCouponApplied(false); }} disabled={status === "loading" || status === "success"} placeholder="Enter coupon code" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-transparent px-4 py-3 font-bold uppercase outline-none focus:border-amber-500 dark:border-white/20" />
          <button type="button" onClick={applyCoupon} disabled={!couponCode || status === "loading" || status === "success"} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">Apply</button>
        </div>

        {message ? <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${status === "error" ? "text-red-600" : "text-emerald-600"}`}>{status === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}{message}</p> : null}

        <button type="button" onClick={couponApplied ? redeemCoupon : continueToPayment} disabled={status === "loading" || status === "success"} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {couponApplied ? "Activate Free Quarterly Pass" : "Continue to Razorpay · ₹129"}
        </button>
        <p className="mt-3 text-center text-xs text-slate-500">Redeem by 15 November 2026. Coupon claims require no card and do not renew automatically. AI Mode is not included.</p>
      </div>
    </div>
  );
}
