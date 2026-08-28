import Razorpay from "razorpay";

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return { keyId, keySecret };
}

function getClient() {
  const { keyId, keySecret } = getCredentials();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function getRazorpayKeyId() {
  return getCredentials().keyId;
}

export async function createRazorpayOrder(payload) {
  try {
    return await getClient().orders.create(payload);
  } catch (error) {
    error.status = error.statusCode || error.status;
    error.details = error.error || error;
    throw error;
  }
}

export function getRazorpayOrder(orderId) {
  return getClient().orders.fetch(orderId);
}

export function getRazorpayPayment(paymentId) {
  return getClient().payments.fetch(paymentId);
}
