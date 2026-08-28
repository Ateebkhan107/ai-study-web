import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProfileAccessProfile, normalizeExamTrack } from "@/lib/accessControl";
import { getRazorpayOrder, getRazorpayPayment } from "@/lib/razorpay";

const PLAN_DURATION = { monthly: 30, quarterly: 90, yearly: 365 };
const PLAN_AMOUNT = { monthly: 49, quarterly: 129, yearly: 399 };
const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3 };

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, message: "Invalid order" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const suppliedSignature = String(razorpay_signature);

    if (expectedSignature.length !== suppliedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(suppliedSignature))) {
      return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
    }

    const [order, payment] = await Promise.all([
      getRazorpayOrder(razorpay_order_id),
      getRazorpayPayment(razorpay_payment_id),
    ]);
    const plan = String(order.notes?.plan || "");
    const orderUserId = String(order.notes?.user_id || "");
    const orderTrack = normalizeExamTrack(order.notes?.exam_track);
    const profile = await getProfileAccessProfile(userId);

    if (
      !PLAN_DURATION[plan] ||
      orderUserId !== userId ||
      orderTrack !== normalizeExamTrack(profile.examTrack) ||
      order.status !== "paid" ||
      Number(order.amount) !== PLAN_AMOUNT[plan] * 100 ||
      Number(order.amount_paid) !== PLAN_AMOUNT[plan] * 100 ||
      order.currency !== "INR" ||
      payment.order_id !== order.id ||
      payment.status !== "captured" ||
      Number(payment.amount) !== PLAN_AMOUNT[plan] * 100 ||
      payment.currency !== "INR"
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

    if (existingSubscription?.razorpay_order_id === order.id) {
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
      razorpay_order_id: order.id,
      razorpay_payment_id: payment.id,
      razorpay_signature: suppliedSignature,
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
    console.error("Razorpay verification failed:", error.details || error);
    return NextResponse.json(
      { success: false, message: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
