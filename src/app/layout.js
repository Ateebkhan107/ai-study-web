import { ClerkProvider } from "@clerk/nextjs";
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

export const metadata = {
  title: "PREPZII– JEE/NEET Preparation",
  description: "Your intelligent JEE & NEET preparation platform",
  icons: {
    icon: [
      { url: "/images/branding/favicon-16x16.png", sizes: "16x16" },
      { url: "/images/branding/favicon-32x32.png", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      afterSignOutUrl={SIGN_IN_ROUTE}
      signInForceRedirectUrl={DASHBOARD_ROUTE}
      signUpForceRedirectUrl={ONBOARDING_ROUTE}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
