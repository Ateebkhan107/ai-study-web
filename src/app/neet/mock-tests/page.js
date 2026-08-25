import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { buildLandingMetadata, SEO_PAGES } from "@/lib/seoLandingPages";

const page = SEO_PAGES.neetMockTests;

export const metadata = buildLandingMetadata(page);

export default function NeetMockTestsPage() {
  return <SeoLandingPage page={page} />;
}
