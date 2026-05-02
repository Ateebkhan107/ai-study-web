"use client";

import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "#" },
  { label: "Test", href: "#" },
  { label: "PYQ", href: "#" },
  { label: "Analytics", href: "#" },
  { label: "Profile", href: "#" },
];

export default function Navbar() {
  const [active, setActive] = useState("Dashboard");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = saved ? saved === "dark" : prefersDark;
    setDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <span className="text-xl font-black tracking-tight text-black dark:text-white font-mono">
            AI STUDY
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150
                ${
                  active === item.label
                    ? "text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60"
                }`}
            >
              {item.label}
              {active === item.label && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>
          ))}

          {/* PRO button */}
          <button
            onClick={() => setActive("PRO")}
            className="relative px-4 py-2 text-sm font-bold rounded-lg bg-[#1e3a5f] text-white opacity-90 hover:opacity-100 transition-opacity duration-150"
          >
            PRO
          </button>

          {/* Theme toggle near PRO */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150"
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </nav>

        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity">
            U
          </div>
        </div>
      </div>
    </header>
  );
}