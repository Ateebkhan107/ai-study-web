import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCashfreePaymentLink, getCashfreeMode } from "@/lib/cashfree";
import { getProfileAccessProfile, normalizeExamTrack } from "@/lib/accessControl";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PLAN_DETAILS = {
  monthly: {
    amount: 49,
    duration: 30,
  },
  quarterly: {
    amount: 129,
    duration: 90,
  },
  yearly: {
    amount: 399,
    duration: 365,
  },
};
const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3 };

export async function POST(req) {
  try {
    const { plan, examTrack } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!PLAN_DETAILS[plan]) {
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
    const selectedPlan = PLAN_DETAILS[plan];
    const normalizedTrack = normalizeExamTrack(profile.examTrack);

    if (normalizeExamTrack(examTrack) !== normalizedTrack) {
      return NextResponse.json(
        { success: false, message: `Switch your profile to ${normalizeExamTrack(examTrack)} before buying that subscription.` },
        { status: 403 }
      );
    }

    const { data: currentSubscription, error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .select("plan,status,expires_at")
      .eq("clerk_user_id", userId)
      .eq("exam_track", normalizedTrack)
      .maybeSingle();

    if (subscriptionError) throw subscriptionError;

    const currentPlan = currentSubscription?.status === "active" &&
      new Date(currentSubscription.expires_at) > new Date()
      ? currentSubscription.plan
      : null;

    if (currentPlan && PLAN_RANK[plan] <= PLAN_RANK[currentPlan]) {
      return NextResponse.json(
        { success: false, message: currentPlan === "yearly" ? "Your Yearly plan is already active." : "Choose a higher plan to upgrade." },
        { status: 409 }
      );
    }

    const clerkUser = await currentUser();
    const customerEmail = clerkUser?.primaryEmailAddress?.emailAddress || undefined;
    const customerPhone = clerkUser?.primaryPhoneNumber?.phoneNumber?.replace(/\D/g, "").slice(-10);
    const mode = getCashfreeMode();

    if (mode === "production" && !customerPhone) {
      return NextResponse.json(
        { success: false, message: "Add a mobile number to your account before purchasing Pro." },
        { status: 400 }
      );
    }

    const linkId = `prepzii_${Date.now()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
    const returnUrl = new URL("/payment/return", req.nextUrl.origin);
    returnUrl.searchParams.set("link_id", linkId);
    const paymentLink = await createCashfreePaymentLink({
      link_id: linkId,
      link_amount: selectedPlan.amount,
      link_currency: "INR",
      link_purpose: `${normalizedTrack} ${plan} Pro subscription`,
      customer_details: {
        customer_name: clerkUser?.fullName || undefined,
        customer_email: customerEmail,
        customer_phone: customerPhone || "9999999999",
      },
      link_notes: {
        user_id: userId,
        plan,
        exam_track: normalizedTrack,
      },
      link_meta: {
        return_url: returnUrl.toString(),
      },
      link_notify: {
        send_sms: false,
        send_email: false,
      },
      link_partial_payments: false,
    });

    return NextResponse.json({
      success: true,
      order: {
        linkId: paymentLink.link_id,
        paymentLink: paymentLink.link_url,
        amount: paymentLink.link_amount,
        currency: paymentLink.link_currency,
        mode,
      },
    });
  } catch (error) {
    console.error("Cashfree order creation failed:", error.details || error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to create order",
      },
      {
        status: 500,
      }
    );
  }
}
