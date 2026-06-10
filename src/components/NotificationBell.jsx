"use client";

import { useState, useRef, useEffect } from "react";

// ─── Mock Notifications ───────────────────────────────────────────────────────
// Replace this with a Supabase realtime query when ready.
// Shape: { id, type, title, body, time, read, href }
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "test",
    title: "New Mock Test Available",
    body: "JEE Advanced Full Mock #15 is ready. Try it now.",
    time: "2 min ago",
    read: false,
    href: "/test",
  },
  {
    id: 2,
    type: "ai",
    title: "AI Recommendation",
    body: "Your Organic Chemistry accuracy dropped to 48%. Focus on Named Reactions.",
    time: "1 hr ago",
    read: false,
    href: "/analytics",
  },
  {
    id: 3,
    type: "pyq",
    title: "New PYQs Added",
    body: "35 new JEE Main 2024 Shift 2 questions have been added.",
    time: "3 hr ago",
    read: false,
    href: "/pyq",
  },
  {
    id: 4,
    type: "reminder",
    title: "Daily Goal Reminder",
    body: "You haven't practiced today. Complete at least one test to stay on track.",
    time: "Yesterday",
    read: true,
    href: "/dashboard",
  },
  {
    id: 5,
    type: "ai",
    title: "Streak at Risk",
    body: "Your 7-day study streak ends tonight. Log in and solve 5 questions.",
    time: "Yesterday",
    read: true,
    href: "/dashboard",
  },
];

// ─── Type metadata ────────────────────────────────────────────────────────────
function typeMeta(type) {
  switch (type) {
    case "test":
      return {
        bg: "bg-blue-500/10",
        color: "text-blue-500",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        ),
      };
    case "ai":
      return {
        bg: "bg-purple-500/10",
        color: "text-purple-500",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        ),
      };
    case "pyq":
      return {
        bg: "bg-emerald-500/10",
        color: "text-emerald-500",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        ),
      };
    case "reminder":
    default:
      return {
        bg: "bg-orange-500/10",
        color: "text-orange-500",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        ),
      };
  }
}

// ─── NotificationBell ─────────────────────────────────────────────────────────
export default function NotificationBell({ count: initialCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="relative" ref={ref}>

      {/* ── Bell Button ── */}
      <div className="relative group">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
          aria-expanded={open}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150
            ${open
              ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 dark:text-gray-300"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {/* Badge */}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-[3px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none border-2 border-white dark:border-gray-950 select-none">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {/* Tooltip — hidden when dropdown is open */}
        {!open && (
          <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
            Notifications
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
          </div>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-black dark:text-white">Notifications</h3>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-[420px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60">
            {notifications.map((n) => {
              const meta = typeMeta(n.type);
              return (
                <li key={n.id}>
                  <a
                    href={n.href}
                    onClick={() => { markRead(n.id); setOpen(false); }}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      !n.read ? "bg-gray-50/80 dark:bg-gray-800/30" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-snug ${!n.read ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1 font-medium">
                        {n.time}
                      </p>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <a
              href="/notifications"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              View all notifications
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

        </div>
      )}
    </div>
  );
}