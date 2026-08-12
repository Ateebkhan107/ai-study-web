import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { normalizeExamTrack } from "@/lib/accessControl";

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

export async function POST(req) {
  try {
    const { plan, examTrack } = await req.json();

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

    const selectedPlan = PLAN_DETAILS[plan];
    const normalizedTrack = normalizeExamTrack(examTrack);

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
