import PublicLandingPage from "./HomePage";
import { publicMetadata } from "@/lib/seo.mjs";

export const metadata = publicMetadata({
  title: "JEE Main & NEET Practice, PYQs and Mock Tests",
  description: "Explore JEE Main and NEET previous-year questions, mock-test options and revision resources. See available practice and access plans on PrepZii.",
  path: "/",
});

export default function HomePage() {
  return <PublicLandingPage />;
}
