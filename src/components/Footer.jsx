"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import Logo from "@/components/Logo";

function LinkedInIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on immersive routes and auth pages
  const hiddenRoutes = [
    "/sign-in",
    "/sign-up",
    "/onboarding",
    "/test/session",
    "/pyq/session",
    "/test/result",
    "/pyq/session/results",
    "/community/groups"
  ];

  if (hiddenRoutes.some(route => pathname?.includes(route)) || pathname === "/") {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const primaryLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Tests", href: "/test" },
    { name: "PYQ", href: "/pyq" },
    { name: "Analytics", href: "/analytics" },
  ];
  const secondaryLinks = [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Help", href: "/help" },
    { name: "Contact", href: "/contact" },
    { name: "Report Bug", href: "/report-bug" },
    { name: "Feedback", href: "/feedback" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Subscriptions", href: "/subscriptions" },
  ];

  const isBattlePage = pathname === "/battle" || pathname?.startsWith("/battle/");
  
  return (
    <footer className={`relative z-10 mt-auto w-full overflow-hidden border-t border-slate-200/70 bg-[var(--card)] dark:border-[var(--border-subtle)]/70 dark:bg-[var(--background)] ${isBattlePage ? 'hidden sm:block' : ''}`}>
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/dashboard" className="group inline-flex items-center gap-2.5">
              <Logo size={28} showText={false} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <span className="text-sm font-black uppercase tracking-tight text-slate-900 transition-colors group-hover:text-amber-500 dark:text-white dark:group-hover:text-amber-400">
                PREPZII
              </span>
            </Link>

            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {primaryLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs font-bold text-slate-600 transition-colors duration-200 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="mailto:contact.prepzii@gmail.com"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-500 dark:bg-[var(--surface-elevated)]/50 dark:hover:bg-indigo-500/10"
              aria-label="Email PrepZii"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/company/124944167/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-[#0A66C2] dark:bg-[var(--surface-elevated)]/50 dark:hover:bg-blue-500/10"
              aria-label="PrepZii LinkedIn"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/prep.zii?igsh=bDRuNW9sZzJocGxr&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-50 hover:text-pink-500 dark:bg-[var(--surface-elevated)]/50 dark:hover:bg-pink-500/10"
              aria-label="PrepZii Instagram"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-[var(--border-subtle)]/50 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {secondaryLinks.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[11px] font-medium text-slate-400 transition-colors duration-200 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 ${
                  i >= 4 ? "hidden sm:inline-block" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              © {currentYear} PrepZii
            </p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Operational • v1.0
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
