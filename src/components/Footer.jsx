"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Hash, Briefcase, MessageSquare, ArrowUpRight } from "lucide-react";

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
    "/pyq/session/results"
  ];

  if (hiddenRoutes.some(route => pathname?.includes(route)) || pathname === "/") {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-[#020617] border-t border-slate-200/60 dark:border-slate-800/60 relative z-10 mt-auto overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/20 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <span className="font-black text-lg tracking-tighter">Pz</span>
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white uppercase transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                PREPZII
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Your intelligent companion for JEE & NEET preparation. Unlock your full potential with AI-powered study plans and analytics.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-300">
                <Hash className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-300">
                <Briefcase className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-300">
                <Code2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-300">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { name: "Dashboard", href: "/dashboard" },
                { name: "Tests", href: "/test" },
                { name: "Previous Year (PYQ)", href: "/pyq" },
                { name: "Analytics", href: "/analytics" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Company & Legal</h3>
            <ul className="space-y-2.5">
              {[
                { name: "About Us", href: "/about" },
                { name: "Careers", href: "/careers" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms & Conditions", href: "/terms" },
                { name: "Subscriptions", href: "/subscriptions" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Support</h3>
            <ul className="space-y-2.5">
              {[
                { name: "Help Center", href: "/help" },
                { name: "Contact Us", href: "/contact" },
                { name: "Report a Bug", href: "/report-bug" },
                { name: "Feedback", href: "/feedback" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 ml-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/50">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            © {currentYear} PrepZii. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              All systems operational • v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
