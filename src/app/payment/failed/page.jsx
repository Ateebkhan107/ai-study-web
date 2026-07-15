export default function PaymentFailed() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-2xl bg-white p-10 shadow-xl text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Payment Failed
        </h1>

        <p className="mt-4 text-gray-600">
          Please try again.
        </p>
      </div>
    </div>
  );
}