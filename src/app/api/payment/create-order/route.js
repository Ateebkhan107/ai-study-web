import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";
import { getActiveSubscriptionsForUser, getProfileAccessProfile, isSubscriptionActive, normalizeExamTrack } from "@/lib/accessControl";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isRazorpayOrderId, RAZORPAY_PLANS } from "@/lib/razorpayPayments.server";

export async function POST(req) {
  try {
    const { plan, examTrack } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (typeof plan !== "string" || !Object.hasOwn(RAZORPAY_PLANS, plan)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plan",
        },
        {
          status: 400,
        }
      );
    }

    if (!examTrack || !["JEE", "NEET"].includes(String(examTrack).toUpperCase())) {
      return NextResponse.json({ success: false, message: "Select JEE Pro or NEET Pro." }, { status: 400 });
    }

    const profile = await getProfileAccessProfile(userId);
    const selectedPlan = RAZORPAY_PLANS[plan];
    const normalizedTrack = normalizeExamTrack(profile.examTrack);

    if (normalizeExamTrack(examTrack) !== normalizedTrack) {
      return NextResponse.json(
        { success: false, message: `Switch your profile to ${normalizeExamTrack(examTrack)} before buying that subscription.` },
        { status: 403 }
      );
    }

    const subscriptions = await getActiveSubscriptionsForUser(userId, normalizedTrack);
    const hasSameOrHigherPlan = subscriptions.some((subscription) => {
      const activePlan = subscription.plan === "quarterly_promo" ? "quarterly" : subscription.plan;
      return isSubscriptionActive(subscription) && RAZORPAY_PLANS[activePlan]?.rank >= selectedPlan.rank;
    });
    if (hasSameOrHigherPlan) {
      return NextResponse.json({ success: false, message: "Choose a higher plan to upgrade." }, { status: 409 });
    }

    const clerkUser = await currentUser();
    const customerEmail = clerkUser?.primaryEmailAddress?.emailAddress || undefined;
    const customerPhone = clerkUser?.primaryPhoneNumber?.phoneNumber?.replace(/\D/g, "").slice(-10);
    const receipt = randomUUID();
    const { error: intentError } = await supabaseAdmin.from("razorpay_checkout_orders").insert({
      receipt,
      clerk_user_id: userId,
      exam_track: normalizedTrack,
      plan,
      amount_paise: selectedPlan.amountPaise,
      currency: "INR",
      duration_days: selectedPlan.durationDays,
    });
    if (intentError) throw intentError;

    const razorpayOrder = await createRazorpayOrder({
      amount: selectedPlan.amountPaise,
      currency: "INR",
      receipt,
      notes: { user_id: userId, plan, exam_track: normalizedTrack },
    });
    if (!isRazorpayOrderId(razorpayOrder?.id) || razorpayOrder.receipt !== receipt ||
        razorpayOrder.amount !== selectedPlan.amountPaise || razorpayOrder.currency !== "INR") {
      throw new Error("Razorpay returned an order that did not match the checkout intent");
    }
    const { data: bound, error: bindError } = await supabaseAdmin.from("razorpay_checkout_orders")
      .update({ provider_order_id: razorpayOrder.id })
      .eq("receipt", receipt)
      .is("provider_order_id", null)
      .select("provider_order_id")
      .maybeSingle();
    if (bindError || !bound) throw bindError || new Error("Checkout order could not be bound");

    return NextResponse.json({
      success: true,
      order: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: getRazorpayKeyId(),
        name: "PrepZii",
        description: `${normalizedTrack} ${plan} Pro subscription`,
        prefill: {
          name: clerkUser?.fullName || "",
          email: customerEmail || "",
          contact: customerPhone || "",
        },
      },
    });
  } catch (error) {
    console.error("[RAZORPAY_ORDER_ERROR]", error?.code || error?.status || "unexpected");
    return NextResponse.json(
      { success: false, message: "Payments are temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
