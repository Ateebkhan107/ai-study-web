import { auth } from "@clerk/nextjs/server";
import {
  getCheckoutOrder,
  isRazorpayOrderId,
  isRazorpayPaymentId,
  redeemRazorpayPayment,
  verifyRazorpaySignature,
} from "@/lib/razorpayPayments.server";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => null);
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body || {};
    if (!isRazorpayOrderId(orderId) || !isRazorpayPaymentId(paymentId)) {
      return Response.json({ success: false, message: "Invalid order" }, { status: 400 });
    }

    const checkout = await getCheckoutOrder(orderId);
    if (!checkout || checkout.clerk_user_id !== userId) {
      return Response.json({ success: false, message: "Checkout order not found. Contact support for older payments." }, { status: 404 });
    }
    if (!verifyRazorpaySignature(process.env.RAZORPAY_KEY_SECRET, `${checkout.provider_order_id}|${paymentId}`, signature)) {
      return Response.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
    }

    const result = await redeemRazorpayPayment(checkout, paymentId);
    if (result === "applied" || result === "already_applied") {
      return Response.json({ success: true, message: "Subscription activated successfully" });
    }
    if (result === "pending_capture") {
      return Response.json({ success: false, message: "Payment capture is still pending. Check your subscription shortly." }, { status: 409 });
    }
    if (["superseded", "conflict", "historical_consumed"].includes(result)) {
      return Response.json({ success: false, message: "This payment needs review. Contact support and keep your payment reference." }, { status: 409 });
    }
    if (result === "invalid") {
      return Response.json({ success: false, message: "Payment does not match this checkout." }, { status: 400 });
    }
    throw new Error("Unexpected Razorpay redemption result");
  } catch (error) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error?.code || error?.statusCode || "unexpected");
    return Response.json({ success: false, message: "Unable to verify payment right now. Check your subscription before paying again." }, { status: 503 });
  }
}
