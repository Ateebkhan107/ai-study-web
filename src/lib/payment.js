export async function createOrder(plan, examTrack) {
  const res = await fetch("/api/payment/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan,
      examTrack,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Unable to create payment order");
  }

  return data.order;
}

export async function openCashfreeCheckout(order) {
  if (!order?.paymentLink) {
    throw new Error("Payment link is unavailable. Please try again.");
  }

  window.location.assign(order.paymentLink);
}

export async function verifyOrder(linkId) {
  const res = await fetch("/api/payment/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ linkId }),
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Unable to verify payment");
  }

  return data;
}
