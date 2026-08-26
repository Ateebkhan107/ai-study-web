"use client";

import { useEffect } from "react";

const WEB_AWESOME_COMPONENTS = [
  () => import("@awesome.me/webawesome/dist/components/tooltip/tooltip.js"),
  () => import("@awesome.me/webawesome/dist/components/dialog/dialog.js"),
  () => import("@awesome.me/webawesome/dist/components/dropdown/dropdown.js"),
  () => import("@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js"),
  () => import("@awesome.me/webawesome/dist/components/tab-group/tab-group.js"),
  () => import("@awesome.me/webawesome/dist/components/tab/tab.js"),
  () => import("@awesome.me/webawesome/dist/components/tab-panel/tab-panel.js"),
  () => import("@awesome.me/webawesome/dist/components/switch/switch.js"),
  () => import("@awesome.me/webawesome/dist/components/drawer/drawer.js"),
  () => import("@awesome.me/webawesome/dist/components/popup/popup.js"),
];

export default function WebAwesomeProvider() {
  useEffect(() => {
    WEB_AWESOME_COMPONENTS.forEach((loadComponent) => {
      loadComponent().catch((error) => {
        console.warn("[WEB_AWESOME_COMPONENT_LOAD_ERROR]", error);
      });
    });
  }, []);

  return null;
}
