"use client";

import { useEffect, useState } from "react";
import { Trash2, Bell, CheckCircle, Rocket, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [track, setTrack] = useState(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load notifications");
        }

        const data = await res.json();

        setTrack(data?.track || "JEE");
        setNotifications(data?.notifications || []);
      } catch (error) {
        console.log("Notification fetch error:", error);
      }
    }

    if (user) {
      loadNotifications();
    }
  }, [user]);

  async function openNotification(item) {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: item.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Read update failed");
      }
    } catch (error) {
      console.log("Read update failed:", error);
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === item.id
          ? { ...notification, is_read: true }
          : notification
      )
    );

    if (item.href) {
      router.push(item.href);
    }
  }

  async function clearAll() {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clearAll: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Clear failed");
      }
    } catch (error) {
      console.log("Clear failed:", error);
      return;
    }

    setNotifications([]);
  }

  return (
    <div
      className="
        min-h-screen
        bg-[var(--background)]
        dark:bg-[var(--background)]
        px-8
        py-12
      "
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="
            flex
            items-start
            justify-between
            mb-8
            gap-4
          "
        >
          <div>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                  return;
                }
                router.push("/dashboard");
              }}
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-xs
                font-bold
                text-gray-500
                hover:text-gray-800
                dark:text-gray-400
                dark:hover:text-gray-200
                transition
              "
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <p
              className="
                tracking-[4px]
                text-[11px]
                font-bold
                text-gray-400
                uppercase
              "
            >
              PrepZii Updates
            </p>

            <h1
              className="
                text-2xl
                font-black
                mt-2
                flex
                items-center
                gap-2
              "
            >
              Notifications <Bell className="w-6 h-6" />
            </h1>

            <p
              className="
                text-gray-400
                text-xs
                mt-2
              "
            >
              {track} updates, tests and announcements
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="
                flex
                shrink-0
                items-center
                gap-2
                bg-red-500
                hover:bg-red-600
                transition
                text-white
                px-4
                py-2
                rounded-xl
                text-xs
                font-bold
                shadow-md
              "
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div
              className="
                bg-[var(--card)]
                dark:bg-[var(--surface)]
                rounded-2xl
                p-12
                text-center
                shadow
              "
            >
              <Bell
                size={38}
                className="
                  mx-auto
                  text-gray-300
                  mb-4
                "
              />

              <h2 className="font-bold text-base">No notifications</h2>

              <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
                You are all caught up <Rocket className="w-3 h-3" />
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => openNotification(item)}
                className="
                  group
                  bg-[var(--card)]
                  dark:bg-[var(--surface)]
                  rounded-2xl
                  px-5
                  py-4
                  shadow-sm
                  hover:shadow-lg
                  transition
                  cursor-pointer
                  border
                  border-gray-100
                  dark:border-[var(--border-subtle)]
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-blue-100
                    text-blue-500
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Bell className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm">{item.title}</h2>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">{item.message}</p>

                  <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                    {item.is_read && (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle size={12} />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
