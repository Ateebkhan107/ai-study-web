import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { buildLandingMetadata, SEO_PAGES } from "@/lib/seoLandingPages";

const page = SEO_PAGES.jeeMockTests;

export const metadata = buildLandingMetadata(page);

export default function JeeMockTestsPage() {
  return <SeoLandingPage page={page} />;
}
