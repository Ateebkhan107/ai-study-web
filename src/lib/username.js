export const RESERVED_USERNAMES = new Set([
  "admin",
  "prepzii",
  "support",
  "root",
]);

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function validateUsername(value) {
  const username = normalizeUsername(value);

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      username,
      error: "Use 3-20 lowercase letters, numbers, or underscores.",
    };
  }

  if (RESERVED_USERNAMES.has(username)) {
    return {
      ok: false,
      username,
      error: "This username is reserved.",
    };
  }

  return { ok: true, username, error: "" };
}

export function isUniqueUsernameError(error) {
  return (
    error?.code === "23505" &&
    String(error?.message || "").toLowerCase().includes("username")
  );
}
