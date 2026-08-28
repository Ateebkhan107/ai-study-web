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

let razorpayScriptPromise;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"));
    document.head.appendChild(script);
  });
  return razorpayScriptPromise;
}

export async function verifyOrder(payment) {
  const res = await fetch("/api/payment/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment),
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Unable to verify payment");
  }

  return data;
}

export async function openRazorpayCheckout(order) {
  if (!order?.orderId || !order?.keyId) {
    throw new Error("Payment order is unavailable. Please try again.");
  }

  await loadRazorpayCheckout();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.orderId,
      prefill: order.prefill,
      theme: { color: "#1e3a5f" },
      handler: async (payment) => {
        try {
          const result = await verifyOrder(payment);
          window.location.href = "/payment/success";
          resolve(result);
        } catch (error) {
          window.location.href = "/payment/failed";
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });
    checkout.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "Payment failed."));
    });
    checkout.open();
  });
}
