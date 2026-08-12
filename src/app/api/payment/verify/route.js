import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeExamTrack } from "@/lib/accessControl";

const PLAN_DURATION = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

const PLAN_AMOUNT = {
  monthly: 49,
  quarterly: 129,
  yearly: 399,
};

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      examTrack,
    } = await req.json();

    // Validate plan
    if (!PLAN_DURATION[plan]) {
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

    // Verify Razorpay Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment signature",
        },
        {
          status: 400,
        }
      );
    }

    // Get Logged-in Clerk User
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const startsAt = new Date();
    const normalizedTrack = normalizeExamTrack(examTrack);

    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + PLAN_DURATION[plan]
    );

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          clerk_user_id: userId,

          plan,

          exam_track: normalizedTrack,

          amount: PLAN_AMOUNT[plan],

          currency: "INR",

          razorpay_order_id,

          razorpay_payment_id,

          razorpay_signature,

          status: "active",

          starts_at: startsAt,

          expires_at: expiresAt,

          updated_at: new Date(),
        },
        {
          onConflict: "clerk_user_id,exam_track",
        }
      );

    if (error) {
      console.error("Supabase Error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Database Error",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
    });

  } catch (error) {
    console.error("Verification Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Verification Failed",
      },
      {
        status: 500,
      }
    );
  }
}
