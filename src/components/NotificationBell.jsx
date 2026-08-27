"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function NotificationBell() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  async function loadNotifications() {
    if (!isLoaded || !user) return;

    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        console.log("Notification error:", response.status);
        return;
      }

      const payload = await response.json();
      setNotifications(payload.notifications || []);
    } catch (error) {
      console.log("Notification error:", error);
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!isLoaded || !user) return;

    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isLoaded, user]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  async function openNotification(item) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === item.id
          ? { ...notification, is_read: true }
          : notification
      )
    );

    await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: item.id,
      }),
    });

    setOpen(false);

    if (item.href && item.href.trim() !== "") {
      router.push(item.href);
    }
  }

  const unread = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="relative flex h-8 w-8 items-center justify-center min-[360px]:h-9 min-[360px]:w-9 sm:h-[38px] sm:w-[38px]">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors duration-200 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-hover)] dark:hover:text-slate-100 min-[360px]:h-9 min-[360px]:w-9 sm:h-[38px] sm:w-[38px]"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />

        {unread > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[9px] font-bold leading-4 text-white sm:min-w-5 sm:px-1.5 sm:text-[10px] sm:leading-5"
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            fixed
            left-3
            right-3
            top-[calc(3.5rem+8px)]
            max-h-[min(70vh,520px)]
            w-auto
            sm:absolute
            sm:left-auto
            sm:right-0
            sm:top-full
            sm:mt-2
            sm:w-[calc(100vw-2rem)]
            sm:max-w-[380px]
            bg-[var(--card)]/90
            dark:bg-[var(--surface)]/90
            backdrop-blur-xl
            border
            border-slate-200/60
            dark:border-[var(--border)]/50
            rounded-2xl
            sm:rounded-3xl
            shadow-2xl
            overflow-hidden
            z-50
          "
        >
          <div
            className="
              p-4
              sm:p-5
              font-black
              text-slate-900
              dark:text-white
              border-b
              border-slate-200/60
              dark:border-[var(--border)]/50
            "
          >
            Notifications
          </div>

          <div className="max-h-[calc(min(70vh,520px)-112px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-slate-400 dark:text-slate-500 text-sm sm:p-5">
                No notifications
              </p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className="
                    p-3.5
                    sm:p-5
                    flex
                    gap-4
                    items-center
                    border-b
                    border-slate-200/60
                    dark:border-[var(--border)]/50
                    cursor-pointer
                    hover:bg-slate-50
                    dark:hover:bg-[var(--card)]/5
                  "
                >
                  <div
                    className="
                      w-8
                      h-8
                      sm:w-10
                      sm:h-10
                      rounded-xl
                      bg-indigo-50
                      dark:bg-indigo-500/10
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="break-words text-xs text-slate-400 dark:text-slate-500">
                      {item.message}
                    </p>
                  </div>

                  {!item.is_read && (
                    <div
                      className="
                        w-2
                        h-2
                        bg-red-500
                        rounded-full
                      "
                    />
                  )}
                </div>
              ))
            )}
          </div>

          <div
            onClick={() => {
              setOpen(false);
              router.push("/notifications");
            }}
            className="
              p-3.5
              sm:p-4
              text-center
              text-xs
              font-bold
              cursor-pointer
              text-slate-500
              dark:text-slate-400
              hover:text-indigo-500
              dark:hover:text-indigo-400
              transition-colors
              border-t
              border-slate-200/60
              dark:border-[var(--border)]/50
            "
          >
            View all notifications →
          </div>
        </div>
      )}
    </div>
  );
}
