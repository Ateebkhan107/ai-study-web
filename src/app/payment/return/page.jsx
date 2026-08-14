import PaymentReturnClient from "./PaymentReturnClient";

export default async function PaymentReturnPage({ searchParams }) {
  const { link_id: linkId } = await searchParams;
  return <PaymentReturnClient linkId={Array.isArray(linkId) ? linkId[0] : linkId} />;
}
