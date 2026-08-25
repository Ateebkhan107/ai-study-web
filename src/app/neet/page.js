import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { buildLandingMetadata, SEO_PAGES } from "@/lib/seoLandingPages";

const page = SEO_PAGES.neet;

export const metadata = buildLandingMetadata(page);

export default function NeetPreparationPage() {
  return <SeoLandingPage page={page} />;
}
