import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getRazorpayOrder, getRazorpayPayment } from "@/lib/razorpay";

export const RAZORPAY_PLANS = {
  monthly: { amountPaise: 4900, durationDays: 30, rank: 1 },
  quarterly: { amountPaise: 12900, durationDays: 90, rank: 2 },
  yearly: { amountPaise: 39900, durationDays: 365, rank: 3 },
  ai_mode: { amountPaise: 199900, durationDays: 30, rank: 4 },
};

export function isRazorpayOrderId(value) {
  return typeof value === "string" && /^order_[A-Za-z0-9]{1,64}$/.test(value);
}

export function isRazorpayPaymentId(value) {
  return typeof value === "string" && /^pay_[A-Za-z0-9]{1,64}$/.test(value);
}

export function verifyRazorpaySignature(secret, data, signature) {
  if (!secret) throw new Error("Razorpay signature secret is unavailable");
  if (typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(createHmac("sha256", secret).update(data).digest(), Buffer.from(signature, "hex"));
}

export async function getCheckoutOrder(orderId) {
  const { data, error } = await supabaseAdmin.from("razorpay_checkout_orders")
    .select("receipt, provider_order_id, clerk_user_id, exam_track, plan, amount_paise, currency")
    .eq("provider_order_id", orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function redeemRazorpayPayment(checkout, paymentId) {
  const [order, payment] = await Promise.all([
    getRazorpayOrder(checkout.provider_order_id),
    getRazorpayPayment(paymentId),
  ]);
  if (order?.id !== checkout.provider_order_id || order.receipt !== checkout.receipt ||
      order.notes?.user_id !== checkout.clerk_user_id || order.notes?.exam_track !== checkout.exam_track ||
      order.notes?.plan !== checkout.plan ||
      order.amount !== checkout.amount_paise || order.currency !== checkout.currency ||
      payment?.id !== paymentId || payment.order_id !== checkout.provider_order_id ||
      payment.amount !== checkout.amount_paise || payment.currency !== checkout.currency ||
      payment.amount_refunded !== 0) {
    return "invalid";
  }
  if (order.status !== "paid" || payment.status !== "captured" || payment.captured !== true ||
      order.amount_paid !== checkout.amount_paise || order.amount_due !== 0) {
    return "pending_capture";
  }

  const { data, error } = await supabaseAdmin.rpc("redeem_verified_razorpay_payment", {
    p_order_id: checkout.provider_order_id,
    p_payment_id: paymentId,
    p_user_id: checkout.clerk_user_id,
    p_amount_paise: payment.amount,
    p_currency: payment.currency,
  });
  if (error) throw error;
  return data;
}
