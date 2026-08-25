import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { buildLandingMetadata, SEO_PAGES } from "@/lib/seoLandingPages";

const page = SEO_PAGES.neetPyq;

export const metadata = buildLandingMetadata(page);

export default function NeetPyqPage() {
  return <SeoLandingPage page={page} />;
}
