import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { buildLandingMetadata, SEO_PAGES } from "@/lib/seoLandingPages";

const page = SEO_PAGES.jeePyq;

export const metadata = buildLandingMetadata(page);

export default function JeePyqPage() {
  return <SeoLandingPage page={page} />;
}
