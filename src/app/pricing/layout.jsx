import { publicMetadata } from "@/lib/seo.mjs";

export const metadata = publicMetadata({
  title: "Pricing and Pro Plans for JEE & NEET",
  description: "Compare PrepZii plans for JEE and NEET practice, chapter-wise PYQs, mock tests and analytics. Review available features and access requirements.",
  path: "/pricing",
});

export default function PricingLayout({ children }) {
  return children;
}
