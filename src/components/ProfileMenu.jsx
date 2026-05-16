"use client";

import { useEffect, useRef, useState } from "react";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    // TODO:
    // clear token / session here

    alert("Signed out");
  };

  return (
    <div className="relative" ref={menuRef}>

      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-bold hover:opacity-80 transition-opacity"
      >
        U
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">

          {/* User Section */}
          <div className="p-5">
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                U
              </div>

              <div>
                <h3 className="font-semibold text-black dark:text-white">
                  Aryan Mehta
                </h3>

                <p className="text-sm text-gray-500">
                  +91 98765 43210
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="border-t border-gray-100 dark:border-gray-800 p-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition text-sm font-semibold text-red-500"
            >
              Sign Out
            </button>
          </div>

        </div>
      )}
    </div>
  );
}