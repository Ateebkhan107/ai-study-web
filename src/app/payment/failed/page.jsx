import Link from "next/link";

export default function PaymentFailed() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-2xl bg-[var(--card)] p-10 shadow-xl text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Payment could not be confirmed
        </h1>

        <p className="mt-4 text-gray-600">
          Check your subscription before paying again. If you were charged and your pass is missing, contact support with your payment reference.
        </p>
        <Link href="/subscriptions" className="mt-5 inline-block font-semibold underline">
          Check my subscription
        </Link>
      </div>
    </div>
  );
}
