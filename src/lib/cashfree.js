const CASHFREE_API_VERSION = "2025-01-01";

function getConfig() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const mode = process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("Cashfree credentials are not configured");
  }

  return {
    clientId,
    clientSecret,
    mode,
    baseUrl: mode === "production"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg",
  };
}

async function cashfreeRequest(path, options = {}) {
  const { clientId, clientSecret, baseUrl } = getConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": CASHFREE_API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || "Cashfree request failed");
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

export function getCashfreeMode() {
  return getConfig().mode;
}

export function getCashfreeOrderPayments(orderId) {
  return cashfreeRequest(`/orders/${encodeURIComponent(orderId)}/payments`);
}

export function createCashfreePaymentLink(payload) {
  return cashfreeRequest("/links", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCashfreePaymentLink(linkId) {
  return cashfreeRequest(`/links/${encodeURIComponent(linkId)}`);
}

export function getCashfreePaymentLinkOrders(linkId) {
  return cashfreeRequest(`/links/${encodeURIComponent(linkId)}/orders`);
}
