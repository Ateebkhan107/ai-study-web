import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import {
  DASHBOARD_ROUTE,
  ONBOARDING_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_UP_ROUTE,
} from "@/lib/auth";

import "./globals.css";

import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  // Resolves all relative URLs in OG images etc. against this base.
  // Change to your production domain before deploying.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://prepzii.com"
  ),

  title: {
    default: "PrepZii – Smart JEE & NEET Preparation Platform",
    template: "%s | PrepZii",
  },

  alternates: {
    canonical: "/",
  },

  description:
    "PrepZii is the intelligent JEE & NEET preparation platform with PYQ practice, full mock tests, AI explanations, formula books, and deep analytics — built to engineer top ranks.",

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
    title: "PrepZii – Smart JEE & NEET Preparation Platform",
    description:
      "The intelligent JEE & NEET preparation platform. PYQ practice, full mock tests, AI explanations, formula books, and deep performance analytics.",
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
    title: "PrepZii – Smart JEE & NEET Preparation Platform",
    description:
      "The intelligent JEE & NEET preparation platform. PYQ practice, full mock tests, AI explanations, and deep performance analytics.",
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
      },
      {
        url: "/images/branding/favicon-32x32.png",
        sizes: "32x32",
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
      "@id": "https://prepzii.com/#organization",
      name: "PrepZii",
      url: "https://prepzii.com",
      logo: {
        "@type": "ImageObject",
        url: "https://prepzii.com/images/branding/prepzii-logo-dark.png",
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
      "@id": "https://prepzii.com/#website",
      url: "https://prepzii.com",
      name: "PrepZii",
      description:
        "Intelligent JEE & NEET preparation platform with PYQ practice, mock tests, and AI-powered analytics.",
      publisher: {
        "@id": "https://prepzii.com/#organization",
      },
    },
  ],
};

const appOrigin = (
  process.env.NEXT_PUBLIC_APP_URL || "https://prepzii.com"
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
          className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}
        >
          <Script
            id="theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: themeInitScript }}
          />
          {/* The payment checkout script is loaded only on pages that need it (/pro, /pricing).
              It was intentionally moved out of the global layout to avoid loading it everywhere. */}
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
