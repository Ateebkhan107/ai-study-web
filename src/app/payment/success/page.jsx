import PaymentSuccessClient from "./PaymentSuccessClient";

export default async function PaymentSuccess({ searchParams }) {
  const params = await searchParams;
  return <PaymentSuccessClient isPromotion={params?.promotion === "DIWALIPREPZII"} />;
}
