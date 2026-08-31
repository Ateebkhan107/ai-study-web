"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

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
  const { isLoaded, isSignedIn, user } = useUser();
  const identifiedUserId = useRef(null);
  const wasSignedIn = useRef(false);

  useEffect(() => {
    WEB_AWESOME_COMPONENTS.forEach((loadComponent) => {
      loadComponent().catch((error) => {
        console.warn("[WEB_AWESOME_COMPONENT_LOAD_ERROR]", error);
      });
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      if (wasSignedIn.current) {
        posthog.reset();
        identifiedUserId.current = null;
      }
      wasSignedIn.current = false;
      return;
    }

    const userId = user?.id;
    if (!userId || identifiedUserId.current === userId) return;

    if (wasSignedIn.current) {
      posthog.reset();
    }

    const personProperties = {};
    const email = user.primaryEmailAddress?.emailAddress;
    if (email) personProperties.email = email;
    if (user.fullName) personProperties.name = user.fullName;

    posthog.identify(userId, personProperties);
    identifiedUserId.current = userId;
    wasSignedIn.current = true;
  }, [isLoaded, isSignedIn, user]);

  return null;
}
