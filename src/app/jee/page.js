import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { buildLandingMetadata, SEO_PAGES } from "@/lib/seoLandingPages";

const page = SEO_PAGES.jee;

export const metadata = buildLandingMetadata(page);

export default function JeePreparationPage() {
  return <SeoLandingPage page={page} />;
}
