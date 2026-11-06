import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveInstituteMembership } from "./instituteMembership.js";

export function slugifyInstituteName(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function getActingUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser().catch(() => null);
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const name = user?.fullName || user?.firstName || user?.username || email || "Student";

  return { userId, user, email, name };
}

export async function getInstituteContext(slug, allowedRoles = ["COACHING_ADMIN", "STUDENT"]) {
  const actor = await getActingUser();
  if (!actor) return { error: unauthorized() };

  const { data: institute, error: instituteError } = await supabaseAdmin
    .from("institutes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (instituteError) throw instituteError;
  if (!institute) {
    return { error: NextResponse.json({ error: "Institute not found" }, { status: 404 }) };
  }
  if (institute.status !== "ACTIVE") {
    return { error: forbidden() };
  }

  const { data: member, error: memberError } = await supabaseAdmin
    .from("institute_members")
    .select("*")
    .eq("institute_id", institute.id)
    .eq("user_id", actor.userId);

  if (memberError) throw memberError;
  const access = resolveInstituteMembership(institute, actor.userId, member || []);
  if (!access || !allowedRoles.includes(access.role)) return { error: forbidden() };

  return { actor, institute, ...access };
}

export async function getProfileMap(userIds = []) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("clerk_user_id,email,full_name,exam,target_year")
    .in("clerk_user_id", uniqueIds);

  if (error) throw error;

  return Object.fromEntries((data || []).map((profile) => [profile.clerk_user_id, profile]));
}
