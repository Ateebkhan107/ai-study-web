import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

import "@awesome.me/webawesome/dist/styles/themes/default.css";

import {
  DASHBOARD_ROUTE,
  ONBOARDING_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_UP_ROUTE,
} from "@/lib/auth";

import "./globals.css";

import Footer from "@/components/Footer";
import WebAwesomeProvider from "@/components/ui/web-awesome-provider";

import { Rajdhani, Space_Grotesk, JetBrains_Mono } from "next/font/google";

const displayFont = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const sansFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  // Resolves all relative URLs in OG images etc. against this base.
  // Change to your production domain before deploying.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.prepzii.com"
  ),

  title: {
    default: "JEE & NEET Mock Tests, PYQs & Analytics | PrepZii",
    template: "%s | PrepZii",
  },

  alternates: {
    canonical: "/",
  },

  description:
    "Practice JEE and NEET previous year questions, take full-length mock tests, revise formula books, track weak chapters, and analyze your performance with PrepZii.",

  keywords: [
    "JEE preparation",
    "NEET preparation",
    "JEE mock test",
    "NEET mock test",
    "PYQ practice",
    "JEE previous year questions",
    "NEET previous year questions",
    "online test series",
    "JEE analytics",
    "PrepZii",
  ],

  openGraph: {
    type: "website",
    siteName: "PrepZii",
    title: "JEE & NEET Mock Tests, PYQs & Analytics | PrepZii",
    description:
      "Practice JEE and NEET previous year questions, take full-length mock tests, revise formula books, track weak chapters, and analyze your performance with PrepZii.",
    url: "/",
    images: [
      {
        url: "/images/branding/prepzii-logo-dark.png",
        width: 1536,
        height: 1024,
        alt: "PrepZii – JEE & NEET Preparation Platform",
      },
    ],
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "JEE & NEET Mock Tests, PYQs & Analytics | PrepZii",
    description:
      "Practice JEE and NEET previous year questions, take full-length mock tests, revise formula books, track weak chapters, and analyze your performance with PrepZii.",
    images: ["/images/branding/prepzii-logo-dark.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/images/branding/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/images/branding/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/images/branding/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/images/branding/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/images/branding/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/images/branding/favicon-dark-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/branding/favicon-dark-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/branding/favicon-dark-48x48.png",
        sizes: "48x48",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/branding/favicon-dark-96x96.png",
        sizes: "96x96",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/branding/favicon-dark-192x192.png",
        sizes: "192x192",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitScript = `
(() => {
  try {
    const hasAppliedDarkDefault = localStorage.getItem("theme-default-dark-applied") === "true";
    let savedTheme = localStorage.getItem("theme");

    if (!hasAppliedDarkDefault) {
      savedTheme = "dark";
      localStorage.setItem("theme", "dark");
      localStorage.setItem("theme-default-dark-applied", "true");
    }

    document.documentElement.classList.toggle("dark", savedTheme !== "light");
    document.documentElement.style.colorScheme = savedTheme === "light" ? "light" : "dark";
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

// Organization + WebSite structured data for Google rich results
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.prepzii.com/#organization",
      name: "PrepZii",
      url: "https://www.prepzii.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.prepzii.com/images/branding/prepzii-logo-dark.png",
      },
      sameAs: [
        "https://www.linkedin.com/company/124944167/",
        "https://www.instagram.com/prep.zii",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact.prepzii@gmail.com",
        contactType: "customer service",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.prepzii.com/#website",
      url: "https://www.prepzii.com",
      name: "PrepZii",
      description:
        "Intelligent JEE & NEET preparation platform with PYQ practice, mock tests, and AI-powered analytics.",
      publisher: {
        "@id": "https://www.prepzii.com/#organization",
      },
    },
  ],
};

const appOrigin = (
  process.env.NEXT_PUBLIC_APP_URL || "https://www.prepzii.com"
).replace(/\/$/, "");

const clerkAllowedRedirectOrigins = Array.from(
  new Set([
    appOrigin,
    "https://prepzii.com",
    "https://www.prepzii.com",
  ])
);

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      allowedRedirectOrigins={clerkAllowedRedirectOrigins}
      afterSignOutUrl={SIGN_IN_ROUTE}
      signInUrl={SIGN_IN_ROUTE}
      signUpUrl={SIGN_UP_ROUTE}
      signInForceRedirectUrl={DASHBOARD_ROUTE}
      signUpForceRedirectUrl={ONBOARDING_ROUTE}
      signInFallbackRedirectUrl={DASHBOARD_ROUTE}
      signUpFallbackRedirectUrl={ONBOARDING_ROUTE}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className="h-full dark"
      >
        <head>
          {/* DNS prefetch + TLS preconnect for external origins */}
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* Structured data for Google rich results */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />
        </head>

        <body
          suppressHydrationWarning
          className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} font-sans min-h-full flex flex-col antialiased`}
        >
          <Script
            id="theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: themeInitScript }}
          />
          <WebAwesomeProvider />
          {/* The payment checkout script is loaded only on pages that need it (/pro, /pricing).
              It was intentionally moved out of the global layout to avoid loading it everywhere. */}
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
