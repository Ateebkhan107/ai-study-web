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
