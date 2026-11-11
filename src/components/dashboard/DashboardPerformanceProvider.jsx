"use client";

import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useDashboardWidget } from "./useDashboardWidget";

const DashboardPerformanceContext = createContext(null);

export function useDashboardPerformance() {
  return useContext(DashboardPerformanceContext);
}

export default function DashboardPerformanceProvider({ userId, children }) {
  const { isLoaded, user } = useUser();
  const ownerId = !isLoaded || user?.id === userId ? userId : null;
  const performance = useDashboardWidget("/api/dashboard-stats", ownerId);
  const position = performance.data?.position;
  const value = position && position.user_id !== ownerId
    ? { ...performance, data: null, status: "error" }
    : performance;
  return <DashboardPerformanceContext.Provider value={value}>{children}</DashboardPerformanceContext.Provider>;
}
