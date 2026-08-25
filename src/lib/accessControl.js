import { clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ACCOUNT_TYPES } from "@/lib/auth";

export const FEATURES = {
  PYQ_FULL: "PYQ_FULL",
  PYQ_RANDOM: "PYQ_RANDOM",
  PYQ_SAVED: "PYQ_SAVED",
  PYQ_CHAPTER: "PYQ_CHAPTER",
  PYQ_MISTAKES: "PYQ_MISTAKES",
  PYQ_ANALYTICS: "PYQ_ANALYTICS",
  DAILY_WARMUP: "DAILY_WARMUP",
  CUSTOM_TEST: "CUSTOM_TEST",
  QUICK_TEST: "QUICK_TEST",
  PREMIUM_MOCK_TEST: "PREMIUM_MOCK_TEST",
  LEADERBOARD: "LEADERBOARD",
  COMMUNITY: "COMMUNITY",
  ANALYTICS_ADVANCED: "ANALYTICS_ADVANCED",
  FORMULA_HANDBOOK: "FORMULA_HANDBOOK",
  AI_EXPLANATION: "AI_EXPLANATION",
  INSTITUTE_WORKSPACE: "INSTITUTE_WORKSPACE",
  INSTITUTE_ASSIGNED_TEST: "INSTITUTE_ASSIGNED_TEST",
};

export const FREE_CUSTOM_TEST_LIMIT = 2;
export const EXAM_TRACKS = {
  JEE: "JEE",
  NEET: "NEET",
};

export const FEATURE_ACCESS_MATRIX = {
  [FEATURES.PYQ_FULL]: { plan: "FREE", label: "PYQ Full Paper" },
  [FEATURES.PYQ_RANDOM]: { plan: "FREE", label: "Random PYQ" },
  [FEATURES.PYQ_SAVED]: { plan: "FREE", label: "Saved PYQs" },
  [FEATURES.PYQ_CHAPTER]: { plan: "PRO", label: "Chapter Wise PYQ" },
  [FEATURES.PYQ_MISTAKES]: { plan: "PRO", label: "Mistakes Redo" },
  [FEATURES.PYQ_ANALYTICS]: { plan: "PRO", label: "PYQ Analytics" },
  [FEATURES.DAILY_WARMUP]: { plan: "FREE", label: "Daily Warmup" },
  [FEATURES.CUSTOM_TEST]: { plan: "LIMITED_FREE", freeLimit: FREE_CUSTOM_TEST_LIMIT, label: "Custom Test Builder" },
  [FEATURES.QUICK_TEST]: { plan: "PRO", label: "Quick Test" },
  [FEATURES.PREMIUM_MOCK_TEST]: { plan: "PRO", label: "Full-Length Mock Tests" },
  [FEATURES.LEADERBOARD]: { plan: "FREE", label: "Leaderboard" },
  [FEATURES.COMMUNITY]: { plan: "FREE", label: "Community" },
  [FEATURES.ANALYTICS_ADVANCED]: { plan: "PRO", label: "Advanced Analytics" },
  [FEATURES.FORMULA_HANDBOOK]: { plan: "FREE", label: "Formula Handbook" },
  [FEATURES.AI_EXPLANATION]: { plan: "PRO", label: "AI Explanation" },
  [FEATURES.INSTITUTE_WORKSPACE]: { plan: "INSTITUTE_MEMBERSHIP", label: "Institute Workspace" },
  [FEATURES.INSTITUTE_ASSIGNED_TEST]: { plan: "INSTITUTE_MEMBERSHIP", label: "Institute Assigned Test" },
};

export function getCurrentMonthWindow(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

export function isSubscriptionActive(subscription, now = new Date()) {
  return Boolean(
    subscription?.status === "active" &&
    subscription?.expires_at &&
    new Date(subscription.expires_at) > now
  );
}

export function normalizeExamTrack(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .startsWith("NEET")
    ? EXAM_TRACKS.NEET
    : EXAM_TRACKS.JEE;
}

export async function getSubscriptionForUser(userId, examTrack) {
  if (!userId) return null;

  const normalizedTrack = examTrack ? normalizeExamTrack(examTrack) : null;
  let query = supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("status", "active");

  if (normalizedTrack) {
    query = query.eq("exam_track", normalizedTrack);
  }

  const { data, error } = await query
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42703" && normalizedTrack) {
      return null;
    }
    throw error;
  }
  return data || null;
}

export async function getActiveSubscriptionTracks(userId) {
  if (!userId) return [];

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("exam_track,expires_at,status")
    .eq("clerk_user_id", userId)
    .eq("status", "active");

  if (error) {
    if (error.code === "42703") {
      return [];
    }
    throw error;
  }

  return [
    ...new Set(
      (data || [])
        .filter((subscription) => isSubscriptionActive(subscription))
        .map((subscription) => normalizeExamTrack(subscription.exam_track))
    ),
  ];
}

export async function getActiveInstituteMemberships(userId, email) {
  if (!userId) return [];

  if (email) {
    const { error: bindError } = await supabaseAdmin
      .from("institute_members")
      .update({ user_id: userId, status: "ACTIVE" })
      .eq("email", email.toLowerCase())
      .is("user_id", null);

    if (bindError) throw bindError;
  }

  const { data, error } = await supabaseAdmin
    .from("institute_members")
    .select("id,role,status,institutes(id,name,slug,logo_url,status,owner_user_id)")
    .eq("user_id", userId)
    .eq("status", "ACTIVE");

  if (error) throw error;

  return (data || [])
    .filter((row) => row.institutes?.status === "ACTIVE")
    .map((row) => ({
      member_id: row.id,
      role: row.role,
      status: row.status,
      institute: row.institutes,
    }));
}

function isPersonalCustomSession(row) {
  const chapters = Array.isArray(row.chapters) ? row.chapters : [];
  if (!chapters.length) return false;
  return chapters.some((chapter) => {
    const value = String(chapter || "").trim().toLowerCase();
    return value && value !== "all chapters";
  });
}

export async function getPersonalCustomTestUsage(userId, now = new Date()) {
  if (!userId) {
    return { used: 0, limit: FREE_CUSTOM_TEST_LIMIT, remaining: FREE_CUSTOM_TEST_LIMIT };
  }

  const { start, end } = getCurrentMonthWindow(now);

  const [{ data: sessions, error: sessionsError }, { data: instituteAttempts, error: instituteError }] = await Promise.all([
    supabaseAdmin
      .from("test_sessions")
      .select("id,chapters,started_at")
      .eq("user_id", userId)
      .gte("started_at", start.toISOString())
      .lt("started_at", end.toISOString()),
    supabaseAdmin
      .from("institute_test_attempts")
      .select("session_id")
      .eq("user_id", userId)
      .gte("started_at", start.toISOString())
      .lt("started_at", end.toISOString()),
  ]);

  if (sessionsError) throw sessionsError;
  if (instituteError) throw instituteError;

  const instituteSessionIds = new Set((instituteAttempts || []).map((row) => row.session_id).filter(Boolean));
  const used = (sessions || []).filter((row) => !instituteSessionIds.has(row.id) && isPersonalCustomSession(row)).length;

  return {
    used,
    limit: FREE_CUSTOM_TEST_LIMIT,
    remaining: Math.max(FREE_CUSTOM_TEST_LIMIT - used, 0),
  };
}

export async function getPlatformAdminStatus(userId) {
  if (!userId) return false;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role === "admin";
  } catch (error) {
    console.error("[PLATFORM_ADMIN_ACCESS_CHECK_ERROR]", error);
    return false;
  }
}

export async function getClerkAccessMetadata(userId) {
  if (!userId) {
    return {
      accountType: ACCOUNT_TYPES.STUDENT,
      isPlatformAdmin: false,
    };
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return {
      accountType: user.publicMetadata?.accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN
        ? ACCOUNT_TYPES.INSTITUTE_ADMIN
        : ACCOUNT_TYPES.STUDENT,
      isPlatformAdmin: user.publicMetadata?.role === "admin",
    };
  } catch (error) {
    console.error("[CLERK_ACCESS_METADATA_ERROR]", error);
    return {
      accountType: ACCOUNT_TYPES.STUDENT,
      isPlatformAdmin: false,
    };
  }
}

export async function getProfileAccessProfile(userId) {
  if (!userId) {
    return {
      accountType: ACCOUNT_TYPES.STUDENT,
      examTrack: EXAM_TRACKS.JEE,
    };
  }

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("account_type,exam")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42703") {
      return {
        accountType: ACCOUNT_TYPES.STUDENT,
        examTrack: EXAM_TRACKS.JEE,
      };
    }
    throw error;
  }

  return {
    accountType: data?.account_type === ACCOUNT_TYPES.INSTITUTE_ADMIN
      ? ACCOUNT_TYPES.INSTITUTE_ADMIN
      : ACCOUNT_TYPES.STUDENT,
    examTrack: normalizeExamTrack(data?.exam),
  };
}

export async function getProfileAccountType(userId) {
  const profile = await getProfileAccessProfile(userId);
  return profile.accountType;
}

export async function getUserAccessContext({ userId, email, examTrack, clerkMetadata } = {}) {
  const [memberships, clerkAccessMetadata, profileAccess, customTestUsage, proTracks] = await Promise.all([
    getActiveInstituteMemberships(userId, email),
    clerkMetadata
      ? Promise.resolve({
        accountType: clerkMetadata.accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN
          ? ACCOUNT_TYPES.INSTITUTE_ADMIN
          : ACCOUNT_TYPES.STUDENT,
        isPlatformAdmin: clerkMetadata.role === "admin",
      })
      : getClerkAccessMetadata(userId),
    getProfileAccessProfile(userId),
    getPersonalCustomTestUsage(userId),
    getActiveSubscriptionTracks(userId),
  ]);

  const activeExamTrack = normalizeExamTrack(examTrack || profileAccess.examTrack);
  const subscription = await getSubscriptionForUser(userId, activeExamTrack);
  const isPro = isSubscriptionActive(subscription);
  const hasCoachingAdminMembership = memberships.some((membership) => membership.role === "COACHING_ADMIN");
  const accountType = clerkAccessMetadata.accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN ||
    profileAccess.accountType === ACCOUNT_TYPES.INSTITUTE_ADMIN ||
    hasCoachingAdminMembership
    ? ACCOUNT_TYPES.INSTITUTE_ADMIN
    : ACCOUNT_TYPES.STUDENT;

  return {
    userId,
    plan: isPro ? "PRO" : "FREE",
    examTrack: activeExamTrack,
    accountType,
    isPro,
    subscription,
    proTracks,
    isPlatformAdmin: clerkAccessMetadata.isPlatformAdmin,
    instituteMemberships: memberships,
    customTestUsage,
  };
}

export function canUseFeature(access, feature, options = {}) {
  const rule = FEATURE_ACCESS_MATRIX[feature];
  if (!rule) return { allowed: false, reason: "UNKNOWN_FEATURE" };

  if (options.context === "INSTITUTE") {
    if (feature === FEATURES.INSTITUTE_ASSIGNED_TEST || feature === FEATURES.INSTITUTE_WORKSPACE) {
      return options.hasActiveMembership
        ? { allowed: true }
        : { allowed: false, reason: "INSTITUTE_MEMBERSHIP_REQUIRED" };
    }
  }

  if (rule.plan === "FREE") return { allowed: true };
  if (rule.plan === "PRO") {
    return access?.isPro
      ? { allowed: true }
      : { allowed: false, reason: "PRO_REQUIRED", upgradeUrl: "/pro" };
  }
  if (rule.plan === "LIMITED_FREE") {
    if (access?.isPro) return { allowed: true, unlimited: true };
    const usage = access?.customTestUsage || { used: 0, limit: FREE_CUSTOM_TEST_LIMIT, remaining: FREE_CUSTOM_TEST_LIMIT };
    return usage.remaining > 0
      ? { allowed: true, usage }
      : { allowed: false, reason: "FREE_CUSTOM_TEST_LIMIT_REACHED", usage, upgradeUrl: "/pro" };
  }
  if (rule.plan === "INSTITUTE_MEMBERSHIP") {
    return access?.instituteMemberships?.length
      ? { allowed: true }
      : { allowed: false, reason: "INSTITUTE_MEMBERSHIP_REQUIRED" };
  }

  return { allowed: false, reason: "UNSUPPORTED_RULE" };
}

export function buildFeaturePermissions(access) {
  return Object.fromEntries(
    Object.values(FEATURES).map((feature) => [feature, canUseFeature(access, feature)])
  );
}
