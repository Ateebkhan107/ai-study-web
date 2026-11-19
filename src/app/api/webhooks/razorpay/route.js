import {
  getCheckoutOrder,
  isRazorpayOrderId,
  isRazorpayPaymentId,
  redeemRazorpayPayment,
  verifyRazorpaySignature,
} from "@/lib/razorpayPayments.server";

export async function POST(request) {
  try {
    const raw = Buffer.from(await request.arrayBuffer());
    if (!verifyRazorpaySignature(process.env.RAZORPAY_WEBHOOK_SECRET, raw, request.headers.get("x-razorpay-signature"))) {
      return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    let event;
    try {
      event = JSON.parse(raw.toString("utf8"));
    } catch {
      return Response.json({ error: "Invalid webhook body" }, { status: 400 });
    }
    if (event?.event !== "payment.captured") return Response.json({ received: true });

    const { id: paymentId, order_id: orderId } = event.payload?.payment?.entity || {};
    if (!isRazorpayOrderId(orderId) || !isRazorpayPaymentId(paymentId)) {
      return Response.json({ error: "Invalid payment event" }, { status: 400 });
    }
    const checkout = await getCheckoutOrder(orderId);
    if (!checkout) {
      console.warn("[RAZORPAY_UNREGISTERED_ORDER]", orderId);
      return Response.json({ received: true, disposition: "unregistered" });
    }

    const result = await redeemRazorpayPayment(checkout, paymentId);
    if (["applied", "already_applied"].includes(result)) return Response.json({ received: true });
    if (["invalid", "superseded", "conflict", "historical_consumed"].includes(result)) {
      console.warn("[RAZORPAY_PAYMENT_REVIEW]", orderId, result);
      return Response.json({ received: true, disposition: result });
    }
    return Response.json({ error: "Redemption temporarily unavailable" }, { status: 503 });
  } catch (error) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]", error?.code || error?.statusCode || "unexpected");
    return Response.json({ error: "Redemption temporarily unavailable" }, { status: 503 });
  }
}
