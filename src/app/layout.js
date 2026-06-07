import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import {
  DASHBOARD_ROUTE,
  ONBOARDING_ROUTE,
  SIGN_IN_ROUTE,
} from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Study – JEE/NEET Dashboard",
  description: "Your intelligent JEE & NEET preparation platform",
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
