import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileAccessProfile, normalizeExamTrack } from "@/lib/accessControl";
import { validateDiwaliCoupon } from "@/lib/diwaliPromotion";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function redeemWithoutPromotionMigration({ userId, examTrack }) {
  const { data: existingRedemption, error: lookupError } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("plan", "quarterly_promo")
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existingRedemption) {
    return { alreadyClaimed: true };
  }

  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + 3);

  const { error: insertError } = await supabaseAdmin.from("subscriptions").insert({
    clerk_user_id: userId,
    exam_track: examTrack,
    plan: "quarterly_promo",
    status: "active",
    razorpay_order_id: `promo_DIWALIPREPZII_${userId}`,
    razorpay_payment_id: "free_coupon",
    razorpay_signature: "server_verified",
    starts_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    amount: 0,
    currency: "INR",
    updated_at: startsAt.toISOString(),
  });

  if (insertError) {
    if (insertError.code === "23505") return { alreadyClaimed: true };
    throw insertError;
  }

  return { expiresAt: expiresAt.toISOString() };
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Sign in to claim this offer." }, { status: 401 });
    }

    const { couponCode, plan, examTrack } = await request.json();
    const validation = validateDiwaliCoupon({ code: couponCode, plan });
    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
    }

    const profile = await getProfileAccessProfile(userId);
    const profileTrack = normalizeExamTrack(profile.examTrack);
    const requestedTrack = normalizeExamTrack(examTrack);
    if (requestedTrack !== profileTrack) {
      return NextResponse.json(
        { success: false, message: `Switch your profile to ${requestedTrack} before claiming that pass.` },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc("redeem_diwali_prepzii_2026", {
      p_clerk_user_id: userId,
      p_exam_track: requestedTrack,
    });

    let redemption = Array.isArray(data) ? data[0] : data;

    if (error && (error.code === "PGRST202" || String(error.message || "").includes("Could not find the function"))) {
      const fallback = await redeemWithoutPromotionMigration({ userId, examTrack: requestedTrack });
      if (fallback.alreadyClaimed) {
        return NextResponse.json({ success: false, message: "You have already claimed this Diwali offer." }, { status: 409 });
      }
      redemption = { expires_at: fallback.expiresAt };
    } else if (error) {
      const message = String(error.message || "");
      if (message.includes("already claimed")) {
        return NextResponse.json({ success: false, message: "You have already claimed this Diwali offer." }, { status: 409 });
      }
      if (message.includes("expired")) {
        return NextResponse.json({ success: false, message: "This Diwali offer expired on 15 November 2026." }, { status: 410 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Your free Quarterly Pass is active.",
      plan: "quarterly",
      examTrack: requestedTrack,
      expiresAt: redemption?.expires_at || null,
    });
  } catch (error) {
    console.error("[DIWALI_PROMOTION_REDEMPTION_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Unable to activate the offer right now. Please try again." },
      { status: 500 }
    );
  }
}
