import Script from "next/script";

export const metadata = {
  title: "Pricing – PrepZii Pro Plans",
  description:
    "Choose a PrepZii Pro plan and unlock unlimited mock tests, chapter-wise PYQs, AI explanations, formula books, and advanced analytics for JEE or NEET preparation.",
  openGraph: {
    title: "PrepZii Pro – Pricing Plans",
    description:
      "Unlock unlimited JEE & NEET prep with PrepZii Pro. Monthly, Quarterly, and Yearly plans available.",
    url: "/pricing",
  },
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingLayout({ children }) {
  return (
    <>
      {/* Razorpay checkout SDK — loaded only on this pricing route */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
