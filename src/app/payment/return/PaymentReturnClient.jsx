"use client";

import { useEffect } from "react";
import { verifyOrder } from "@/lib/payment";

export default function PaymentReturnClient({ linkId }) {
  useEffect(() => {
    let active = true;

    async function confirmPayment() {
      try {
        if (!linkId) throw new Error("Missing payment link");
        await verifyOrder(linkId);
        if (active) window.location.replace("/payment/success");
      } catch (error) {
        console.error(error);
        if (active) window.location.replace("/payment/failed");
      }
    }

    confirmPayment();
    return () => { active = false; };
  }, [linkId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
        <h1 className="text-xl font-bold">Confirming your payment…</h1>
        <p className="mt-2 text-sm text-slate-400">Please don&apos;t close this page.</p>
      </div>
    </main>
  );
}
