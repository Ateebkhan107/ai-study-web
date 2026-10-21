"use client";

// Memory only; scoped by Clerk user. Reloading discards the draft. Tokens are
// opaque server-owned state, never used as authorization by the client.
const tokens = new Map();
const listeners = new Set();
export function subscribeBuilder(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function readBuilderToken(userId) { return userId ? tokens.get(userId) : undefined; }
export function rememberBuilderAction(userId, action) {
  if (userId && action?.type === "ai_test_builder") {
    tokens.set(userId, action.token);
    for (const listener of listeners) listener();
  }
}
export function clearBuilderToken(userId) { tokens.delete(userId); for (const listener of listeners) listener(); }
