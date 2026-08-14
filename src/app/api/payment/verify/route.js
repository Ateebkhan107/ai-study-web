import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProfileAccessProfile, normalizeExamTrack } from "@/lib/accessControl";
import {
  getCashfreeOrderPayments,
  getCashfreePaymentLink,
  getCashfreePaymentLinkOrders,
} from "@/lib/cashfree";

const PLAN_DURATION = { monthly: 30, quarterly: 90, yearly: 365 };
const PLAN_AMOUNT = { monthly: 49, quarterly: 129, yearly: 399 };
const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3 };

export async function POST(req) {
  try {
    const { linkId } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!linkId || !String(linkId).startsWith("prepzii_")) {
      return NextResponse.json({ success: false, message: "Invalid order" }, { status: 400 });
    }

    const [paymentLink, linkOrders] = await Promise.all([
      getCashfreePaymentLink(linkId),
      getCashfreePaymentLinkOrders(linkId),
    ]);
    const orders = Array.isArray(linkOrders) ? linkOrders : linkOrders?.orders || [];
    const order = orders.find((candidate) => candidate.order_status === "PAID");
    const payments = order ? await getCashfreeOrderPayments(order.order_id) : [];
    const successfulPayment = payments.find(
      (payment) => payment.payment_status === "SUCCESS" && payment.is_captured !== false
    );
    const plan = String(paymentLink.link_notes?.plan || "");
    const orderUserId = String(paymentLink.link_notes?.user_id || "");
    const orderTrack = normalizeExamTrack(paymentLink.link_notes?.exam_track);
    const profile = await getProfileAccessProfile(userId);

    if (
      !PLAN_DURATION[plan] ||
      orderUserId !== userId ||
      orderTrack !== normalizeExamTrack(profile.examTrack) ||
      paymentLink.link_status !== "PAID" ||
      Number(paymentLink.link_amount) !== PLAN_AMOUNT[plan] ||
      Number(paymentLink.link_amount_paid) !== PLAN_AMOUNT[plan] ||
      paymentLink.link_currency !== "INR" ||
      !order ||
      !successfulPayment ||
      Number(successfulPayment.payment_amount) !== PLAN_AMOUNT[plan] ||
      successfulPayment.payment_currency !== "INR"
    ) {
      return NextResponse.json(
        { success: false, message: "Payment is not complete or does not match this subscription." },
        { status: 400 }
      );
    }

    const startsAt = new Date();
    const { data: existingSubscription, error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .select("plan,status,expires_at,razorpay_order_id")
      .eq("clerk_user_id", userId)
      .eq("exam_track", orderTrack)
      .maybeSingle();

    if (subscriptionError) throw subscriptionError;

    if (existingSubscription?.razorpay_order_id === order.order_id) {
      return NextResponse.json({ success: true, message: "Subscription already activated" });
    }

    const activeCurrentPlan = existingSubscription?.status === "active" &&
      new Date(existingSubscription.expires_at) > startsAt
      ? existingSubscription.plan
      : null;

    if (activeCurrentPlan && PLAN_RANK[plan] <= PLAN_RANK[activeCurrentPlan]) {
      return NextResponse.json(
        { success: false, message: "Only upgrades to a higher plan are allowed." },
        { status: 409 }
      );
    }

    const currentExpiry = existingSubscription?.expires_at
      ? new Date(existingSubscription.expires_at)
      : null;
    const expiresAt = currentExpiry && currentExpiry > startsAt
      ? currentExpiry
      : new Date(startsAt);
    expiresAt.setDate(expiresAt.getDate() + PLAN_DURATION[plan]);

    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      clerk_user_id: userId,
      plan,
      exam_track: orderTrack,
      amount: PLAN_AMOUNT[plan],
      currency: "INR",
      // Legacy column names are retained until the payment-history schema is migrated.
      razorpay_order_id: order.order_id,
      razorpay_payment_id: String(successfulPayment.cf_payment_id),
      razorpay_signature: "cashfree_api_verified",
      status: "active",
      starts_at: startsAt,
      expires_at: expiresAt,
      updated_at: new Date(),
    }, { onConflict: "clerk_user_id,exam_track" });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
    });
  } catch (error) {
    console.error("Cashfree verification failed:", error.details || error);
    return NextResponse.json(
      { success: false, message: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
