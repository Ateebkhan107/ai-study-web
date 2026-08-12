import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import razorpay from "@/lib/razorpay";
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

    const options = {
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `prepzii_${normalizedTrack.toLowerCase()}_${Date.now()}`,
      notes: {
        plan,
        examTrack: normalizedTrack,
        duration: selectedPlan.duration,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create order",
      },
      {
        status: 500,
      }
    );
  }
}
