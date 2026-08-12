import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import {
  DASHBOARD_ROUTE,
  ONBOARDING_ROUTE,
  SIGN_IN_ROUTE,
} from "@/lib/auth";

import "./globals.css";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Footer from "@/components/Footer";

export const metadata = {
  title: "PREPZII – JEE/NEET Preparation",

  description:
    "Your intelligent JEE & NEET preparation platform",

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

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      afterSignOutUrl={SIGN_IN_ROUTE}
      signInForceRedirectUrl={DASHBOARD_ROUTE}
      signUpForceRedirectUrl={ONBOARDING_ROUTE}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className="h-full dark"
      >
        <head>
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
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
          />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
