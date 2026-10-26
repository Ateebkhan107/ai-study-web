"use client";
import { createContext, useContext, useMemo } from "react";
const Identity = createContext(null);
export function SyntheticIdentity({ userId, children }) {
  const user = useMemo(() => userId ? { id: userId, firstName: "Synthetic Student", fullName: "Synthetic Student" } : null, [userId]);
  return <Identity.Provider value={user}>{children}</Identity.Provider>;
}
export function useUser() { const user = useContext(Identity); return { user, isLoaded: true, isSignedIn: Boolean(user) }; }
